/**
 * 短时间(1min-15min)下潜（3%以上）并回升的票(1%-3%幅度的误差)
 * 回升时间取 1min， 3min， 5min... 时间段做测试，筛选一个比较可靠的区间
 * 数据路径存储：./src/db/analyze/peer-deals/v-lines
 */
const path = require('path')
const { writeFileSync, readFileSync, readDirSync } = require(global.utils)
const save_vlines_dir = `${global.db}/analyze/peer-deals/vlines/`
const read_shadowline_dir = `${global.db}/analyze/peer-deals/shadowlines/` 
const read_peerdeal_dir = `${global.db}/warehouse/peer-deals/`
const time_dvd = global.vline.time_dvd || 15 * 60 * 1000 // 默认为15分钟间隔
const price_range = global.vline.price_range || 0.03 // 默认为3%价格间隔
module.exports = async function vlines () {
  const unCalculateDates = getUnCalculateDates()
  const qualityStocksInDate = queryQualityStockObj(unCalculateDates)
  console.log('recordRightRange')
  recordRightRange(qualityStocksInDate)
}

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
  const qualityStocksInDate = {
    // 'date': ['stocks']
  }
  const dateFolders = unCalculateDates
  for (let folderIndex = 0; folderIndex < dateFolders.length; folderIndex++) {
    const date = dateFolders[folderIndex]
    const stocks = readDirSync(path.join(read_shadowline_dir, date))
    for (let stockIndex = 0; stockIndex < stocks.length; stockIndex++) {
      const stock = stocks[stockIndex]
      const stockPeerAnilyze = readFileSync(path.join(read_shadowline_dir, date, stock))
      const { overview } = stockPeerAnilyze
      // 直接过滤掉 振幅低于 3% 的票
      if (overview.waves_percent > 0.03) {
        // 把 overview 并到peerdeal中，方便计算的时候调取已经算好的数据
        if (!qualityStocksInDate[date]) {
          qualityStocksInDate[date] = [{
            stock: stock,
            opn_pice: overview.opn_pice,
            min_pice: overview.min_pice,
          }]
        } else {
          qualityStocksInDate[date].push({
            stock: stock,
            opn_pice: overview.opn_pice,
            min_pice: overview.min_pice,
          })
        }
      }
    }
  }
  return qualityStocksInDate
}

function recordRightRange (qualityStocksInDate) {
  for (const date in qualityStocksInDate) {
    console.log(date)
    const stockObj = qualityStocksInDate[date]
    for (let index = 0; index < stockObj.length; index++) {
      const { stock, opn_pice, min_pice } = stockObj[index]
      const dealData = readFileSync(path.join(read_peerdeal_dir, date, stock))
      const res = calculateVline(date, opn_pice, min_pice, dealData.data)
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
 *  sal_p_v: (sum_sal_p / sum_sal_v).toFixed(2), // 卖出均价
 *  sum_buy_p: (sum_buy_p).toFixed(2), // 买入总额
 *  sum_buy_v: (sum_buy_v).toFixed(2), // 买入总手数
 *  sum_sal_p: (sum_sal_p).toFixed(2), // 卖出总额
 *  sum_sal_v: (sum_sal_v).toFixed(2), // 卖出总手数
 *  heavy_buy: (heavy_buy).toFixed(2), // 大单买入额
 *  heavy_sal: (heavy_sal).toFixed(2)  // 大单卖出额
 * },...]
 *
 */
// function calculateVline (date, stock) {
//   const res = []
//   const dealData = readFileSync(path.join(read_peerdeal_dir, date, stock))
//   const deals = dealData.data
//   let rangeCans = []
//   let startSite = null
//   let endSite = null
//   let isLowDeep = false
//   let isCoverUp = false
//   let open_p = dealData.cp / 1000
//   for (let index = 0; index < deals.length; index++) {
//     // {
//     //   "t": 91509,
//     //   "p": 34870, 
//     //   "v": 109,
//     //   "bs": 4
//     // },
//     const dealObj = deals[index]
    
//     // 9点25分之前的数据都不算
//     if (dealObj.t < 92500) continue

//     // 转换数据格式，方便计算
//     dealObj.t = timeFormat(date, dealObj.t)
//     dealObj.p = dealObj.p / 1000
//     // 初始先给 startSite 赋值
//     if (!startSite && !endSite) {
//       startSite = dealObj
//     }
//     // 判断 time_dvd 时间内的交易
//     if (new Date(dealObj.t) - new Date(startSite.t) <= time_dvd) {
//       rangeCans.push(dealObj)
//       endSite = dealObj

//       if (!isLowDeep) {
//         // 15分钟内，如果价差大于 -3%(开盘价 * 0.03)，那么就可以判定为V型线开始
//         if (endSite.p - startSite.p <= -(open_p * price_range)) {
//           console.log(date, stock, '下潜 => ', '开始：', startSite.p, '结束：', endSite.p, '认定位置：', -(open_p * price_range))
//           isLowDeep = true
//         }
//       }
      
//       if (isLowDeep && !isCoverUp) {
//         // 如果价差开始回升，小于 -1% 或者 大于 开始下跌的价格，就说明形成了V型线
//         if (endSite.p - startSite.p >= -(open_p * 0.01) || endSite.p > startSite.p) {
//           console.log(date, stock, '回升 => ', '开始：', startSite.p, '结束：', endSite.p, '认定位置：', -(open_p * 0.01))
//           isCoverUp = true
//           // 成功获取起点和终点
//           // 进行时间点的记录
//           res.push(sumRanges(rangeCans))

//           // 重新赋值，进入下一个轮询
//           {
//             rangeCans = []
//             startSite = null
//             isLowDeep = null
//             isCoverUp = null
//             endSite = null
//           }
//         }
//       }
//     } else {
//       // 如果超过15分钟，重新给 startSite 赋值，进入下一个轮询
//       rangeCans = []
//       startSite = null
//       isLowDeep = null
//       isCoverUp = null
//       endSite = null
//     }
//   }
//   return res
// }

// {
//   "t": 91509,
//   "p": 34870, 
//   "v": 109,
//   "bs": 4
// },
function calculateVline (date, opn_pice, min_pice, deals) {
  const res = {}
  const open_p = opn_pice
  const deep_p = min_pice

  let lt_cans = []
  let rt_cans = []

  let lt_site = null
  let rt_site = null
  let deep_site = null

  let deep_indx = 0
  for (let index = 0; index < deals.length; index++) {
    const dealItem = deals[index]
    
    // 9点25分之前的数据都不算
    if (dealItem.t < 92500) continue

    const curItemPrice = dealItem.p / 1000
    if (curItemPrice === deep_p) {
      deep_site.t = timeFormat(date, deep_site.t)
      deep_site.p = deep_site.p / 1000
      deep_indx = index
      deep_site = dealItem
      break
    }
  }

  console.log('deep_site:', deep_site)
  if (!deep_site) return res

  // lt_site
  for (let j = deep_indx; j > 0; j--) {
    const lt_dealItem = deals[j]

    // 9点25分之前的数据都不算
    if (lt_dealItem.t < 92500) continue

    // 转换数据格式，方便计算
    lt_dealItem.t = timeFormat(date, lt_dealItem.t)
    lt_dealItem.p = lt_dealItem.p / 1000
    if (new Date(deep_site.t) - new Date(lt_dealItem.t) <= time_dvd) {
      lt_cans.unshift(lt_dealItem)
      if (lt_dealItem.p - deep_site.p >= (open_p * price_range)) {
        lt_site = lt_dealItem
        break
      }
    } else {
      break
    }
  }

  console.log('lt_site:', lt_site)
  if (!lt_site) return res

  // rt_site
  for (let k = deep_indx; k < deals.length; k++) {

    const rt_dealItem = deals[k]

    // 9点25分之前的数据都不算
    if (rt_dealItem.t < 92500) continue

    // 转换数据格式，方便计算
    rt_dealItem.t = timeFormat(date, rt_dealItem.t)
    rt_dealItem.p = rt_dealItem.p / 1000
    if (new Date(rt_dealItem.t) - new Date(deep_site.t) <= time_dvd) {
      rt_cans.push(rt_dealItem)
      if (rt_dealItem.p - deep_site.p >= (open_p * price_range)) {
        rt_site = rt_dealItem
        break
      }
    } else {
      break
    }
  }

  console.log('rt_site:', rt_site)
  if (!rt_site) return res

  return sumRanges(lt_cans.concat(rt_cans))
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
    const sum_p = canItem.p * canItem.v * 100
    // 每单金额超过10W，就当作大单记录
    if (sum_p >= 100000) {
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
        heavy_sal += element.p * element.v * 100
      }
      if (element.bs === 2) {
        heavy_buy += element.p * element.v * 100
      }
    })
  }

  return {
    heavies, // 买入总额
    timeRange: `${rangeCans[0].t} ~ ${rangeCans[rangeCans.length - 1].t}`, // 买入总额
    buy_p_v: (sum_buy_p / sum_buy_v / 100).toFixed(2), // 买入均价
    sal_p_v: (sum_sal_p / sum_sal_v / 100).toFixed(2), // 卖出均价
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
