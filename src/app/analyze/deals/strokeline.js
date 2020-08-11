/**
 * 直上直下的分时形态判断
 * 初步肯定，这是有庄家的征兆
 */
const path = require('path')
const { writeFileSync, connectStock, isEmptyObject } = require(global.utils)
const strokeline_dir = `strokeline`
const deals_dir = `deals`
const price_range = 0.02 // 默认为3%价格间隔
const haevy_standard = global.vline.haevy_standard || 10 * 10000 // 大单的标准
module.exports = async function vline () {
  // const recordedDates = unrecordFiles(strokeline_dir)
  connectStock(deals_dir, (dealData, stock, date)=> {
    const result = calculateStorkeline(date, stock, dealData)
    if (!isEmptyObject(result)) {
      writeFileSync(path.join(global.db_api, save_vline_dir, date, stock + '.json'), result)
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
  const stroklines = [
    {
      t: '111 ~ 111',
      p: '111 ~ 111',
      heavy_deals: []
    }
  ]
  let strokStart = null
  let strokEnd = null

  const divd_p = open_p * price_range
  // 价格的涨幅再2个点以上，但是时间间隔不能超过1分钟，
  // 并且需要记录，主动购买多少
  for (let index = 0; index < deals.length; index++) {
    const dealItem = deals[index]
    
    // 9点25分之前的数据都不算
    if (dealItem.t < 92500) continue

    if (dealItem.p === deep_p) {
      deep_indx = index
      deep_site = dealItem
      break
    }
  }

  // if (!deep_site) return {}

  // // lt_site
  // for (let j = deep_indx; j > 0; j--) {
  //   const lt_dealItem = deals[j]

  //   // 9点25分之前的数据都不算
  //   if (lt_dealItem.t < 92500) continue
  //   const deep_time = new Date(timeFormat(date, deep_site.t))
  //   const left_time = new Date(timeFormat(date, lt_dealItem.t))
  //   if (deep_time - left_time <= time_dvd) {
  //     lt_cans.push(lt_dealItem)
  //     if (lt_dealItem.p - deep_site.p >= divd_p) {
  //       lt_site = lt_dealItem
  //       break
  //     }
  //   } else {
  //     break
  //   }
  // }

  // if (!lt_site) return {}
  // // rt_site
  // for (let k = deep_indx; k < deals.length; k++) {

  //   const rt_dealItem = deals[k]

  //   // 9点25分之前的数据都不算
  //   if (rt_dealItem.t < 92500) continue

  //   const deep_time = new Date(timeFormat(date, deep_site.t))
  //   const rigt_time = new Date(timeFormat(date, rt_dealItem.t))
  //   if (rigt_time - deep_time <= time_dvd) {
  //     rt_cans.push(rt_dealItem)
  //     if (rt_dealItem.p - deep_site.p >= divd_p) {
  //       rt_site = rt_dealItem
  //       break
  //     }
  //   } else {
  //     break
  //   }
  // }
  // if (!rt_site) return {}
  console.log(date, stock, '下潜：', lt_site, ' 回升：', rt_site)
  const res = sumRanges(lt_cans.concat(rt_cans))
  res.start_p = lt_site.p
  res.deep_p = deep_site.p
  res.end_p = rt_site.p
  res.deep_size = (lt_site.p - deep_site.p) / open_p
  res.open_p = open_p
  res.close_p = close_p
  res.high_p = high_p
  res.name = name
  return res
}

function sumRanges (rangeCans) {
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
  let heavy_buy = 0
  let heavy_sal = 0
  const heavies = []
  for (let index = 0; index < rangeCans.length; index++) {
    const canItem = rangeCans[index]
    const sum_p = (canItem.p / 1000) * (canItem.v * 100)
    // 每单金额超过10W，就当作大单记录
    if (sum_p >= haevy_standard) {
      heavies.push(canItem)
    }

    if (canItem.bs === 1) {
      sum_sal_p += sum_p
      sum_sal_v += canItem.v
    }

    if (canItem.bs === 2) {
      sum_buy_p += sum_p
      sum_buy_v += canItem.v
    }
  }

  // 汇总大单金额
  if (heavies.length) {
    heavies.forEach(element => {
      if (element.bs === 1) {
        heavy_sal += (element.p / 1000) * element.v * 100
      }
      if (element.bs === 2) {
        heavy_buy += (element.p / 1000) * element.v * 100
      }
    })
  }

  return {
    heavies, // 买入总额
    timeRange: `${rangeCans[0].t} ~ ${rangeCans[rangeCans.length - 1].t}`, // 买入总额
    buy_p_v: (sum_buy_p / (sum_buy_v * 100)).toFixed(2), // 买入均价
    sal_p_v: (sum_sal_p / (sum_sal_v * 100)).toFixed(2), // 卖出均价
    sum_buy_p: sum_buy_p, // 买入总额
    sum_buy_v: sum_buy_v, // 买入手数
    sum_sal_p: sum_sal_p, // 卖出总额
    sum_sal_v: sum_sal_v, // 卖出手数
    heavy_buy: heavy_buy, // 大单买入额
    heavy_sal: heavy_sal // 大单卖出额
  }
}

function timeFormat (date, t) {
  t = t + ''
  const s = t.substring(t.length - 2, t.length)
  const m = t.substring(t.length - 4, t.length - 2)
  const h = t.substring(t.length - 6, t.length - 4)
  return `${date} ${h}:${m}:${s}`
}
