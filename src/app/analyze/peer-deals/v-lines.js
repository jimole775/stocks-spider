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
module.exports = function () {
// 先获取，当天振幅超过3%的票
// F:\MyPro\stocks\src\db\analyze\peer-deals\shadowline
const stocks = queryFitSTock()

}

const shadowlineBsaeDir = `{global.srcRoot}/db/analyze/peer-deals/shadowline`
async function queryFitSTock () {
  const fitStocks = {
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
      if (diff_p && Number.parseFloat(diff_p) >= 3) {
        if (!fitStocks[date]) {
          fitStocks[date] = [stock]
        } else {
          fitStocks[date].push(stock)
        }
      }
    }
  }
  return fitStocks
}

const peerDealBsaeDir = `{global.srcRoot}/db/warehouse/peer-deals`
// F:\MyPro\stocks\src\db\warehouse\peer-deals
function calc (date, stock) {
  // * {
  // *  '12:11-12:12': {
  // *    v_p: 123, // 成交均价
  // *    sum_p: 12345, // 成交总额
  // *    sum_v: 12345, // 成交量
  // *    pecent: 12%, // 成交比重
  // *    heavy: [] // 大单记录
  // *  }
  // * }
  // {
  //   "t": 91509,
  //   "p": 34870,
  //   "v": 109,
  //   "bs": 4
  // },
  const target = path.join(peerDealBsaeDir, date, stock + '.json')
  const deals = readFileSync(target)
  deals.forEach(dealObj => {
    const time = timeFormat(dealObj.t)
    
  })
}

function timeFormat (t) {
  t = t + ''
  const s = t.substring(t.length - 2, t.length)
  const m = t.substring(t.length - 4, t.length - 2)
  const h = t.substring(t.length - 6, t.length - 2)
  return `${h}-${m}-${s}`
}
