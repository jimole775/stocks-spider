/**
 * 直上直下的分时形态判断
 * 初步肯定，这是有庄家的征兆
 */
const path = require('path')
const { writeFileSync, connectStock, isEmptyObject } = require(global.utils)
const strokeline_dir = `strokeline`
const deals_dir = `deals`
const price_range = 0.03 // 默认为3%价格间隔
const time_range = 5
const haevy_standard = global.vline.haevy_standard || 10 * 10000 // 大单的标准
module.exports = async function vline () {
  // const recordedDates = unrecordFiles(strokeline_dir)
  connectStock(deals_dir, (dealData, stock, date)=> {
    const result = calculateStorkeline(date, stock, dealData)
    if (result && !isEmptyObject(result)) {
      console.log(result)
      writeFileSync(path.join(global.db_api, strokeline_dir, date, stock + '.json'), result)
    }
  })
}

function unrecordFiles () {

}

/**
 * 
 * @param {*} date 
 * @param {*} stock 
 * return {
 *  strokes: [{
 *    lineSize: +- x,
 *    cost: +- xxx,
 *    timeRange: xxx ~ xxx,
 *    isRollback: boolean,
 *    rollbackTime: xxx,
 *    rollbackCost: +-xxx,
 *  }],
 *  open_pice: 5.05, // 开盘价
 *  clos_pice: 5.09, // 收盘价
 *  min_pice: 4.83, // 最低价
 *  max_pice: 5.16, // 最高价
 *  name: xxx,
 *  code: xxx,
 * }
 *
 */
// {
//   "t": 91509,
//   "p": 34870, 价格在t不超过5分钟的时间，涨跌幅超过3%
//   "v": 109,
//   "bs": 4
// },
function calculateStorkeline (date, stock, dealData) {
  const name = dealData.n
  const open_p = dealData.cp
  const close_p = dealData.ep
  const high_p = dealData.hp
  const deep_p = dealData.dp
  const deals = dealData.data
  const res = {
     strokes: [
      // {
      //   lineSize: '+- x',
      //   cost: '+- xxx',
      //   timeRange: 'xxx ~ xxx',
      //   isRollback: 'boolean',
      //   rollbackTime: 'xxx',
      //   rollbackCost: '+-xxx',
      // }
    ],
    open_pice: open_p, // 开盘价
    clos_pice: close_p, // 收盘价
    min_pice: deep_p, // 最低价
    max_pice: high_p, // 最高价
    name: name,
    code: stock,
  }

  const divd_p = open_p * price_range
  if (Math.abs(deep_p - high_p) <= divd_p) return null

  // 切分为 1分钟 一个刻度，如果前面的一分钟的最高价和后面一分钟的最高价，如果是呈梯级上升的，旧存储起来，前一分钟的最低价为起点，继续获取后一分钟的最高价，进行比对，直到5分钟结束，如果都没有出现直线
  // 5分钟小组中，如果连续1分钟刻度是连续上涨或者下跌的，可以跳出来，和下一个5分钟小组合并，以求出涨幅超过3%的，不过需要控制在5个刻度内

  let startItem = null
  // 价格的涨幅在3个点以上，但是时间间隔不能超过5分钟，
  // 并且需要记录，主动购买多少

  let indistinctRanges = []
  // 一分钟内，存储最高的值，再比对第二分钟内的最高的值，直到5分钟内的最高值
  for (let i = 0; i < deals.length; i++) {
    startItem = deals[i]

    // 9点25分之前的数据都不算
    if (startItem.t < 92500) continue

    for (let j = i; j < deals.length; j++) {
      const endItem = deals[j]
      if (isInRangeTime(startItem, endItem, date)) {
        const prevItem = deals[j - 1] || endItem
        const nextItem = deals[j + 1] || endItem
        indistinctRanges.push(endItem)
      } else {
        const correctRanges = matchRightStroke(indistinctRanges, divd_p)
        if (correctRanges && correctRanges.length) {
          // 1. 如果得出了一个正确的直线，需要考虑的是，后面是否会持续上涨
          // 2. 如果后面不上涨，需要把i定到当前直线结束的位置
          res.strokes.push(sumRanges(correctRanges))
        }
        indistinctRanges = []
        // i = j
        break
      }
    }
  }

  if (res.strokes.length === 0) return null
  return res
}

function matchRightStroke (indistinctRanges, divd_p) {
  let high = { p: 0, index: 0 }
  let deep = { p: 999999, index: 0 }
  const res = []
  indistinctRanges.forEach((item, index) => {
    if (item.p > high.p) {
      high.p = item.p
      high.index = index
    }
    if (item.p < deep.p) {
      deep.p = item.p
      deep.index = index
    }
  })
  if (high.p - deep.p > divd_p) {
    for (let i = deep.index; i < high.index - deep.index; i++) {
      res.push(indistinctRanges[i])
    }
  }
  return res
}

function sumRanges (correctRanges) {
  // {
  //   "t": 91509,
  //   "p": 34870,
  //   "v": 109,
  //   "bs": 4 // 1卖， 2买， 4竞价
  // },
  let sum_buy_p = 0
  let sum_buy_v = 0
  let sum_sal_p = 0
  let sum_sal_v = 0
  let heavy_buy_p = 0
  let heavy_sal_p = 0
  let heavy_buy_v = 0
  let heavy_sal_v = 0
  const heavies = []
  for (let index = 0; index < correctRanges.length; index++) {
    const dealItem = correctRanges[index]
    const sum_p = (dealItem.p / 1000) * (dealItem.v * 100)
    // 每单金额超过10W，就当作大单记录
    if (sum_p >= haevy_standard) {
      heavies.push(dealItem)
    }

    if (dealItem.bs === 1) {
      sum_sal_p += sum_p
      sum_sal_v += dealItem.v
    }

    if (dealItem.bs === 2) {
      sum_buy_p += sum_p
      sum_buy_v += dealItem.v
    }
  }

  // 汇总大单金额
  if (heavies.length) {
    heavies.forEach(element => {
      if (element.bs === 1) {
        heavy_sal_p += (element.p / 1000) * element.v * 100
        heavy_sal_v += element.v
      }
      if (element.bs === 2) {
        heavy_buy_p += (element.p / 1000) * element.v * 100
        heavy_buy_v += element.v
      }
    })
  }

  return {
    // heavies, // 买入总额
    time_range: `${correctRanges[0].t} ~ ${correctRanges[correctRanges.length - 1].t}`, // 买入总额
    buy_p_v: (sum_buy_p / (sum_buy_v * 100)).toFixed(2) * 1, // 买入均价
    sal_p_v: (sum_sal_p / (sum_sal_v * 100)).toFixed(2) * 1, // 卖出均价
    sum_buy_p, // 买入总额
    sum_buy_v, // 买入手数
    sum_sal_p, // 卖出总额
    sum_sal_v, // 卖出手数
    heavy_buy_p, // 大单买入额
    heavy_sal_p, // 大单卖出额
    heavy_buy_v, // 大单买入额
    heavy_sal_v, // 大单卖出额
    heavy_buy_p_v: (heavy_buy_p / (heavy_buy_v * 100)).toFixed(2) * 1, // 买入均价
    heavy_sal_p_v: (heavy_sal_p / (heavy_sal_v * 100)).toFixed(2) * 1, // 卖出均价
  }
}

function timeFormat (date, t) {
  t = t + ''
  const s = t.substring(t.length - 2, t.length)
  const m = t.substring(t.length - 4, t.length - 2)
  const h = t.substring(t.length - 6, t.length - 4)
  return `${date} ${h}:${m}:${s}`
}

function isInRangeTime (startItem, endItem, date) {
  return new Date(timeFormat(date, endItem.t)) - new Date(timeFormat(date, startItem.t)) <= time_range * 60 * 1000
}
