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
const shadowlineBsaeDir = `{global.srcRoot}/db/analyze/peer-deals/shadowline` 
const peerDealBsaeDir = `{global.srcRoot}/db/warehouse/peer-deals`
module.exports = function () {
// 先获取，当天振幅超过3%的票
const qualityStockObj = queryQualityStockObj()

}

async function queryQualityStockObj () { 
  const qualitySTock = {
    // 'date': ['stocks']
  }
  const dateDirs = fs.readDirSync(shadowlineBsaeDir)
  for (let dirIndex = 0; dirIndex < dateDirs.length; dirIndex++) {
    const date = dateDirs[dirIndex]
    const stocks = fs.readDirSync(path.join(shadowlineBsaeDir, date))
    for (let stockIndex = 0; stockIndex < stocks.length; stockIndex++) {
      const stock = stocks[stockIndex]
      const stockPeerAnilyze = await readFileSync(path.join(shadowlineBsaeDir, date, stock))
      const { overview: { diff_p }} = stockPeerAnilyze

      // 直接过滤掉 振幅低于 3% 的票
      if (diff_p && Number.parseFloat(diff_p) >= 3) {
        if (!qualitySTock[date]) {
          qualitySTock[date] = [stock]
        } else {
          qualitySTock[date].push(stock)
        }
      }
    }
  }
  return qualitySTock
}
function recordRightRange (qualityStockObj) {
  for (const { date, stocks } of qualityStockObj) {
    for (let index = 0; index < stocks.length; index++) {
      const stock = stocks[index]
      calcLogic(date, stock)
    }
  }

  return 
}

/**
 * 
 * @param {*} date 
 * @param {*} stock 
 * return [{
*      v_p: 123, // 成交均价
*      sum_p: 12345, // 成交总额
*      sum_v: 12345, // 成交量
*      pecent: 12%, // 成交比重
*      heavy: [] // 大单记录
 * }]
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
  const tmpCan = []
  const target = path.join(peerDealBsaeDir, date, stock + '.json')
  const deals = readFileSync(target)
  const startSite = null
  const endSite = null
  const open_p = null
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
        tmpCan.push(dealObj)
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
            calcAtimes(tmpCan)
            // 成功获取起点和终点
            // 进行时间点的记录
            // res.push({
            //   start: startSite,
            //   end: endSite
            // })
            // todo 计算

            // 重新赋值，进入下一个轮询
            tmpCan = []
            startSite = null
            isLowDeep = null
            isCoverUp = null
            endSite = null
          }
        }
      } else {
        // 如果超过15分钟，重新给 startSite 赋值，进入下一个轮询
        tmpCan = []
        startSite = null
        isLowDeep = null
        isCoverUp = null
        endSite = null
      }
  }
  return res
}

function calcAtimes (cans) {
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
  //   "bs": 4
  // },
  let sum_p = 0
  let sum_v = 0
  const heavy = []
  for (let index = 0; index < cans.length; index++) {
    const canItem = cans[index]
    sum_p += canItem.p * canItem.v * 100
    sum_v += canItem.v
    if (sum_p >= 100000) {
      heavy.push({
        v: canItem.v,
        p: canItem.p
      })
    }
  }
  return {
    timeRange: `${cans[0].t}~${cans[cans.length - 1].t}`,
    v_p: sum_p / sum_v,
    heavy,
    sum_v,
    sum_p,
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
  return ((p / 1000) + '').toFixed(2)
}
