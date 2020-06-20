/**
 * 短时间(1min-15min)下潜（3%以上）并回升的票(1%-3%幅度的误差)
 * 回升时间取 1min， 3min， 5min... 时间段做测试，筛选一个比较可靠的区间
 * 数据路径存储：./src/db/analyze/peer-deals/v-lines
 */
const path = require('path')
const { writeFileSync, readFileSync, readDirSync, moneyFormat } = require(global.utils)
const save_vlines_dir = `${global.db}/analyze/peer-deals/vlines/`
const read_shadowline_dir = `${global.db}/analyze/peer-deals/shadowlines/` 
const read_peerdeal_dir = `${global.db}/warehouse/peer-deals/`
const time_dvd = global.vline.time_dvd || 15 * 60 * 1000 // 默认为15分钟间隔
const price_range = global.vline.price_range || 0.03 // 默认为3%价格间隔
module.exports = async function vlines () {
  const unCalculateDates = getUnCalculateDates()
  const qualityStockObj = await queryQualityStockObj(unCalculateDates)
  recordRightRange(qualityStockObj)
}

// { date1:[], date2:[], date3:[] }
// 由于计算顺序是从前到后，
// 那么可以理解，只要vlines目录的最后一个日期存在数据，
// 就可以肯定前面的日期都已经计算过了
function getUnCalculateDates () {
  const vlineDates = readDirSync(save_vlines_dir)
  const recordedDates = readDirSync(read_peerdeal_dir)
  if (vlineDates.length === 0) {
    return recordedDates
  } else {
    const unRecords = recordedDates.filter(($date) => {
      return !vlineDates.includes($date)
    })
    // 有可能最后一个date目录的票子还没统计完，
    // 所以，不管如何，把他压到unRecords里面，
    // 保证万无一失
    unRecords.unshift(vlineDates.pop())
    return unRecords
  }
}

// 根据shadowlines的记录，振幅小于 3 个点的都过滤掉
function queryQualityStockObj (unCalculateDates = []) {
  const qualitySTockObj = {
    // 'date': ['stocks']
  }
  const dateFolders = unCalculateDates
  for (let folderIndex = 0; folderIndex < dateFolders.length; folderIndex++) {
    const date = dateFolders[folderIndex]
    const stocks = readDirSync(path.join(read_shadowline_dir, date))
    for (let stockIndex = 0; stockIndex < stocks.length; stockIndex++) {
      const stock = stocks[stockIndex]
      const stockPeerAnilyze = readFileSync(path.join(read_shadowline_dir, date, stock))
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
      const res = calculateVline(date, stock)
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
 *  buy_p_v: (sum_buy_p / sum_buy_v).toFixed(2), // 买入均价
 *  sale_p_v: (sum_sale_p / sum_sale_v).toFixed(2), // 卖出均价
 *  sum_buy_p: (sum_buy_p).toFixed(2), // 买入总额
 *  sum_buy_v: (sum_buy_v).toFixed(2), // 买入总手数
 *  sum_sale_p: (sum_sale_p).toFixed(2), // 卖出总额
 *  sum_sale_v: (sum_sale_v).toFixed(2), // 卖出总手数
 *  heavy_buy: (heavy_buy).toFixed(2), // 大单买入额
 *  heavy_sale: (heavy_sale).toFixed(2) // 大单卖出额
 * },...]
 *
 */
function calculateVline (date, stock) {
  const res = []
  const deals = readFileSync(path.join(read_peerdeal_dir, date, stock))
  let rangeCans = []
  let startSite = null
  let endSite = null
  let open_p = null
  let isLowDeep = false
  let isCoverUp = false
  for (let index = 0; index < deals.length; index++) {
    // {
    //   "t": 91509,
    //   "p": 34870, 
    //   "v": 109,
    //   "bs": 4
    // },
    const dealObj = deals[index]
    
    // 9点25分之前的数据都不算
    if (dealObj.t < 92500) break

    // 记录开盘价
    if (/^925/.test(dealObj.t)) open_p = priceFormat(dealObj.p)

    // 如果当前股票的当日，收集不到 9:25 之前的竞价信息，只能取 9:25 之后的第一个成交价作为开盘价
    if (!open_p) open_p = priceFormat(dealObj.p)

    // 转换数据格式，方便计算
    dealObj.t = timeFormat(date, dealObj.t)
    dealObj.p = priceFormat(dealObj.p)
    // 初始先给 startSite 赋值
    if (!startSite && !endSite) {
      startSite = dealObj
    }
    // 判断 time_dvd 时间内的交易
    if (new Date(dealObj.t) - new Date(startSite.t) <= time_dvd) {
      rangeCans.push(dealObj)
      endSite = dealObj

      if (!isLowDeep) {
        // 15分钟内，如果价差大于 -3%(开盘价 * 0.03)，那么就可以判定为V型线开始
        if (endSite.p - startSite.p <= -(open_p * price_range)) {
          console.log(date, stock, '下潜 => ', '开始：', startSite.p, '结束：', endSite.p, '认定位置：', -(open_p * price_range))
          isLowDeep = true
        }
      }
      
      if (isLowDeep && !isCoverUp) {
        // 如果价差开始回升，小于 -1% 或者 大于 开始下跌的价格，就说明形成了V型线
        if (endSite.p - startSite.p >= -(open_p * 0.01) || endSite.p > startSite.p) {
          console.log(date, stock, '回升 => ', '开始：', startSite.p, '结束：', endSite.p, '认定位置：', -(open_p * 0.01))
          isCoverUp = true
          // 成功获取起点和终点
          // 进行时间点的记录
          res.push(sumRanges(rangeCans))

          // 重新赋值，进入下一个轮询
          {
            rangeCans = []
            startSite = null
            isLowDeep = null
            isCoverUp = null
            endSite = null
          }
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
  // {
  //   "t": 91509,
  //   "p": 34870, 
  //   "v": 109,
  //   "bs": 4 // 1卖， 2买， 4竞价
  // },
  let sum_buy_p = 0
  let sum_buy_v = 0
  let sum_sale_p = 0
  let sum_sale_v = 0
  let heavy_buy = 0
  let heavy_sale = 0
  const heavies = []
  for (let index = 0; index < rangeCans.length; index++) {
    const canItem = rangeCans[index]
    if (canItem.bs === 1) {
      const sale_p = canItem.p * canItem.v * 100
      sum_sale_p += sale_p
      sum_sale_v += canItem.v
      // 每单金额超过10W，就当作大单记录
      if (sale_p >= 100000) {
        heavies.push(canItem)
      }
    }

    if (canItem.bs === 2) {
      const buy_p = canItem.p * canItem.v * 100
      sum_buy_p += buy_p
      sum_buy_v += canItem.v
      // 每单金额超过10W，就当作大单记录
      if (buy_p >= 100000) {
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
    timeRange: `${rangeCans[0].t} ~ ${rangeCans[rangeCans.length - 1].t}`, // 买入总额
    buy_p_v: (sum_buy_p / sum_buy_v).toFixed(2), // 买入均价
    sale_p_v: (sum_sale_p / sum_sale_v).toFixed(2), // 卖出均价
    sum_buy_p: moneyFormat(sum_buy_p), // 买入总额
    sum_buy_v: sum_buy_v, // 买入手数
    sum_sale_p: moneyFormat(sum_sale_p), // 卖出总额
    sum_sale_v: sum_sale_v, // 卖出手数
    heavy_buy: moneyFormat(heavy_buy), // 大单买入额
    heavy_sale: moneyFormat(heavy_sale) // 大单卖出额
  }
}

function timeFormat (date, t) {
  t = t + ''
  const s = t.substring(t.length - 2, t.length)
  const m = t.substring(t.length - 4, t.length - 2)
  const h = t.substring(t.length - 6, t.length - 4)
  return `${date} ${h}:${m}:${s}`
}

function priceFormat (p) {
  return (p / 1000).toFixed(2)
}
