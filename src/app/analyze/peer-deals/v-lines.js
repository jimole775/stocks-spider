/**
 * 短时间(1min-15min)下潜（3%以上）并回升的票(1%-3%幅度的误差)
 * 回升时间取 1min， 3min， 5min... 时间段做测试，筛选一个比较可靠的区间
 * 数据路径：F:\MyPro\stocks\src\db\analyze\peer-deals\v-lines
 * return:
 * {
 *  '12:11-12:12': {
 *    v_p: 123, // 成交均价
 *    sum_p: 12345, // 成交总额
 *    sum_v: 12345, // 成交量
 *    pecent: 12%, // 成交比重
 *    heavy: [] // 大单记录
 *  }
 * }
 */
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { writeFileSync, readFileSync } = require(global.utils)
const save_vlines_dir = `${global.db}/analyze/peer-deals/vlines/`
const read_shadowline_dir = `${global.db}/analyze/peer-deals/shadowlines` 
const read_peerdeal_dir = `${global.db}/warehouse/peer-deals/`
module.exports = async function vlines () {
  // 先获取，当天振幅超过3%的票
  const qualityStockObj = await queryQualityStockObj()
  recordRightRange(qualityStockObj)
}

async function queryQualityStockObj () {
  const qualitySTockObj = {
    // 'date': ['stocks']
  }
  const dateDirs = fs.readdirSync(read_shadowline_dir)
  for (let dirIndex = 0; dirIndex < dateDirs.length; dirIndex++) {
    const date = dateDirs[dirIndex]
    const stocks = await fs.readdirSync(path.join(read_shadowline_dir, date))
    for (let stockIndex = 0; stockIndex < stocks.length; stockIndex++) {
      const stock = stocks[stockIndex]
      const stockPeerAnilyze = await readFileSync(path.join(read_shadowline_dir, date, stock))
      const { overview: { diff_p }} = stockPeerAnilyze

      // 直接过滤掉 振幅低于 3% 的票
      if (diff_p && Number.parseFloat(diff_p) >= 3) {
        if (!qualitySTockObj[date]) {
          qualitySTockObj[date] = [stock]
        } else {
          qualitySTockObj[date].push(stock)
        }
      }
    }
  }
  return Promise.resolve(qualitySTockObj)
}

function recordRightRange (qualityStockObj) {
  for (const date in qualityStockObj) {
    const stocks = qualityStockObj[date]
    for (let index = 0; index < stocks.length; index++) {
      const stock = stocks[index]
      console.log('running:', stock)
      const res = calcLogic(date, stock)
      if (res && res.length) writeFileSync(path.join(save_vlines_dir, date, stock), res)
    }
  }
}

/**
 * 
 * @param {*} date 
 * @param {*} stock 
 * return [{
 *  heavies, // 买入总额
 *  timeRange: `${rangeCans[0].t}~${rangeCans[rangeCans.length - 1].t}`, // 买入总额
 *  v_p_buy: (sum_p_buy / sum_v_buy).toFixed(2), // 买入均价
 *  v_p_sale: (sum_p_sale / sum_v_sale).toFixed(2), // 卖出均价
 *  sum_p_buy: (sum_p_buy).toFixed(2), // 买入总额
 *  sum_v_buy: (sum_v_buy).toFixed(2), // 买入总额
 *  sum_p_sale: (sum_p_sale).toFixed(2), // 买入总额
 *  sum_v_sale: (sum_v_sale).toFixed(2), // 买入总额
 *  heavy_buy: (heavy_buy).toFixed(2), // 买入总额
 *  heavy_sale: (heavy_sale).toFixed(2) // 买入总额
 * },...]
 *
 */
function calcLogic (date, stock) {
  /**
  * date: {
  *  stock: [
  *    {
  *      v_p: 123, // 成交均价
  *      sum_p: 12345, // 成交总额
  *      sum_v: 12345, // 成交量
  *      pecent: 12%, // 成交比重
  *      heavy: [] // 大单记录
  *    }
  *  ],
   };
  */
  /**
    {
      "t": 91509,
      "p": 34870, 
      "v": 109,
      "bs": 4
    },
    */
  const res = []
  const deals = readFileSync(path.join(read_peerdeal_dir, date, stock))

  let rangeCans = []
  let startSite = null
  let endSite = null
  let open_p = null
  let isLowDeep = false
  let isCoverUp = false
  for (let index = 0; index < deals.length; index++) {
    const dealObj = deals[index]
      // 9点25分之前的数据都不算
      if (dealObj.t < 92500) return

      // 记录开盘价
      if (/^925/.test(dealObj.t)) open_p = priceFormat(dealObj.p)

      // 转换数据格式，方便计算
      dealObj.t = timeFormat(dealObj.t)
      dealObj.p = priceFormat(dealObj.p)
  
      // 初始先给 startSite 赋值
      if (!startSite && !endSite) {
        startSite = dealObj
      }
  
      // 判断 15 分钟内的交易
      if (moment(dealObj.t) - moment(startSite.t) <= 15 * 60 * 1000) {
        rangeCans.push(dealObj)
        endSite = dealObj
  
        if (!isLowDeep) {
          // 如果价差大于 -3%
          if (endSite.P - startSite.P >= -(open_p * 0.03)) {
            isLowDeep = true
          }
        }
        
        if (isLowDeep && !isCoverUp) {
          // 如果价差小于 -1% 或者 大于 开始下跌的价格
          if (endSite.P - startSite.P <= -(open_p * 0.01) || endSite.P > startSite.P) {
            isCoverUp = true
            res.push(sumRanges(rangeCans))
            // 成功获取起点和终点
            // 进行时间点的记录
            // res.push({
            //   start: startSite,
            //   end: endSite
            // })
            // todo 计算

            // 重新赋值，进入下一个轮询
            rangeCans = []
            startSite = null
            isLowDeep = null
            isCoverUp = null
            endSite = null
          }
        }
      } else {
        // 如果超过15分钟，重新给 startSite 赋值，进入下一个轮询
        rangeCans = []
        startSite = null
        isLowDeep = null
        isCoverUp = null
        endSite = null
      }
  }
  return res
}

function sumRanges (rangeCans) {
  // *return:     [{
  //          timeRange: '12:11-12:12'
  //   *      v_p: 123, // 成交均价
  //   *      sum_p: 12345, // 成交总额
  //   *      sum_v: 12345, // 成交量
  //   *      pecent: 12%, // 成交比重 @todo 暂时不做，因为计算量太大
  //   *      heavy: [] // 大单记录
  //   *    }]
  // {
  //   "t": 91509,
  //   "p": 34870, 
  //   "v": 109,
  //   "bs": 4 // 1卖， 2买， 4竞价
  // },
  let sum_p_buy = 0
  let sum_v_buy = 0
  let sum_p_sale = 0
  let sum_v_sale = 0
  let heavy_buy = 0
  let heavy_sale = 0
  const heavies = []
  for (let index = 0; index < rangeCans.length; index++) {
    const canItem = rangeCans[index]
    if (canItem.bs === 1) {
      sum_p_sale += canItem.p * canItem.v * 100
      sum_v_sale += canItem.v
      // 每单金额超过10W，就当作大单记录
      if (sum_p_sale >= 100000) {
        heavies.push(canItem)
      }
    }

    if (canItem.bs === 2) {
      sum_p_buy += canItem.p * canItem.v * 100
      sum_v_buy += canItem.v
      // 每单金额超过10W，就当作大单记录
      if (sum_p_buy >= 100000) {
        heavies.push(canItem)
      }
    }
  }

  // 汇总大单金额
  if (heavies.length) {
    heavies.forEach(element => {
      if (element.bs === 1) {
        heavy_sale += element.p * element.v * 100
      }
      if (element.bs === 2) {
        heavy_buy += element.p * element.v * 100
      }
    })
  }

  return {
    heavies, // 买入总额
    timeRange: `${rangeCans[0].t}~${rangeCans[rangeCans.length - 1].t}`, // 买入总额
    v_p_buy: (sum_p_buy / sum_v_buy).toFixed(2), // 买入均价
    v_p_sale: (sum_p_sale / sum_v_sale).toFixed(2), // 卖出均价
    sum_p_buy: (sum_p_buy).toFixed(2), // 买入总额
    sum_v_buy: (sum_v_buy).toFixed(2), // 买入总额
    sum_p_sale: (sum_p_sale).toFixed(2), // 买入总额
    sum_v_sale: (sum_v_sale).toFixed(2), // 买入总额
    heavy_buy: (heavy_buy).toFixed(2), // 买入总额
    heavy_sale: (heavy_sale).toFixed(2) // 买入总额
  }
}

function timeFormat (t) {
  t = t + ''
  const s = t.substring(t.length - 2, t.length)
  const m = t.substring(t.length - 4, t.length - 2)
  const h = t.substring(t.length - 6, t.length - 2)
  return `${global.finalDealDate} ${h}:${m}:${s}`
}

function priceFormat (p) {
  return (p / 1000).toFixed(2)
}
