/**
 * 短时间(1min-15min)下潜（3%以上）并回升的票(1%-3%幅度的误差)
 * 回升时间取 1min， 3min， 5min... 时间段做测试，筛选一个比较可靠的区间
 * 数据路径存储：
 */
const path = require('path')
const { writeFileSync, connectStock, isEmptyObject, unrecordFiles } = require(global.utils)
const save_vlines_dir = `vlines`
const read_peerdeal_dir = `/warehouse/peer-deals/`
const time_dvd = global.vline.time_dvd || 15 * 60 * 1000 // 默认为15分钟间隔
const price_range = global.vline.price_range || 0.03 // 默认为3%价格间隔
const haevy_standard = global.vline.haevy_standard || 10 * 10000 // 大单的标准
module.exports = async function vlines () {
  // 有可能最后一个date目录的票子还没统计完，
  // 所以，不管如何，把他压到unRecords里面，
  // 保证万无一失
  const recordedDates = unrecordFiles(save_vlines_dir)
  connectStock(read_peerdeal_dir, recordedDates, (dealData, stock, date)=> {
    const result = calculateVline(date, stock, dealData)
    if (!isEmptyObject(result)) {
      writeFileSync(path.join(global.db_api, save_vlines_dir, date, stock + '.json'), result)
    }
  })
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
// {
//   "t": 91509,
//   "p": 34870, 
//   "v": 109,
//   "bs": 4
// },
function calculateVline (date, stock, dealData) {
  const res = {}
  const open_p = dealData.cp
  const deep_p = dealData.dp
  const deals = dealData.data
  const divd_p = open_p * price_range
  const lt_cans = []
  const rt_cans = []
  let lt_site = null
  let rt_site = null
  let deep_site = null

  let deep_indx = 0
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

  if (!deep_site) return res

  // lt_site
  for (let j = deep_indx; j > 0; j--) {
    const lt_dealItem = deals[j]

    // 9点25分之前的数据都不算
    if (lt_dealItem.t < 92500) continue
    const deep_time = new Date(timeFormat(date, deep_site.t))
    const left_time = new Date(timeFormat(date, lt_dealItem.t))
    if (deep_time - left_time <= time_dvd) {
      lt_cans.push(lt_dealItem)
      if (lt_dealItem.p - deep_site.p >= divd_p) {
        lt_site = lt_dealItem
        break
      }
    } else {
      break
    }
  }

  if (!lt_site) return res
  // rt_site
  for (let k = deep_indx; k < deals.length; k++) {

    const rt_dealItem = deals[k]

    // 9点25分之前的数据都不算
    if (rt_dealItem.t < 92500) continue

    const deep_time = new Date(timeFormat(date, deep_site.t))
    const rigt_time = new Date(timeFormat(date, rt_dealItem.t))
    if (rigt_time - deep_time <= time_dvd) {
      rt_cans.push(rt_dealItem)
      if (rt_dealItem.p - deep_site.p >= divd_p) {
        rt_site = rt_dealItem
        break
      }
    } else {
      break
    }
  }
  if (!rt_site) return res
  console.log(date, stock, '下潜：', lt_site, ' 回升：', rt_site)

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
