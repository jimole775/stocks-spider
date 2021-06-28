// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
const querystring = require('querystring')
/**
 * kline的api的拼装函数
 * @param { Object | Map } param get类型的参数，这些参数都是预存在base.json里的
 * @return { Object | Map } { stockCode, daily, week, month }
 */
module.exports = function klineApiFactory ({ secid, cb, ut, _, fqt = 0 }) {
  const klineApi_daily = spill({ klt: 101, secid, cb, ut, _, fqt}) // klt: 101 日线
  const klineApi_week = spill({ klt: 102, secid, cb, ut,  _, fqt}) // klt: 102 周线
  const klineApi_month = spill({ klt: 103, secid, cb, ut,  _, fqt}) // klt: 103 月线
  return { stockCode: secid.split('.').pop(), klineApi_daily, klineApi_week, klineApi_month}
}

// secid: 股票市场 + 股票代码 1.600001
// cb: jsonp的回调名
// ut: 用户token
// _: 时间戳
// fqt: '0'-不复权，'1'-前复权
// klt: k线类型，101=日线，102=周线，103=月线
function spill (record) {
  const defaultQuery = {
    fields1: 'f1,f2,f3,f4,f5',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    end: 20500101,
    lmt: global.kline.page_size || 120,
    ...record
  }
  const host = 'push2his.eastmoney.com/api/qt/stock/kline/get'
  const serveId = Math.round(Math.random() * 10) + '' + Math.round(Math.random() * 10)
  return `http://${serveId}.${host}?${querystring.encode(defaultQuery)}`
}
