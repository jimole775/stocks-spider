// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
const querystring = require('querystring')
// { cb, ut, _ }
module.exports = function klineApiFactory ({ secid, cb, ut, _, fqt = 0 }) {
  // console.log(secid)
  // const serveId = Math.round(Math.random() * 10) + '' + Math.round(Math.random() * 10)
  // api = api.replace(/^http:\/\/(\d{2}).push2his/g, `http:\/\/${serveId}.push2his`)
  // const [host, query] = api.split('?')
  // const queryObj = querystring.decode(query)
  // const stockCode = queryObj.secid.split('.').pop() // secid: '1.603005',
  // queryObj.lmt = global.kline.page_size || 120 // lmt: '120',
  // fqt = fqt // fqt: '0'-不复权，'1'-前复权,
  const klineApi_daily = spill({ klt: 101, secid, cb, ut, _, fqt}) // klt: 101 日线
  const klineApi_week = spill({ klt: 102, secid, cb, ut,  _, fqt}) // klt: 102 周线
  const klineApi_month = spill({ klt: 103, secid, cb, ut,  _, fqt}) // klt: 103 月线
  return { stockCode: secid.split('.').pop(), klineApi_daily, klineApi_week, klineApi_month}
}

// cb: 'jQuery112403637119003265299_1593112370285'
// ut: 'fa5fd1943c7b386f172d6893dbfba10b'
// klt: 101 102 103
// _: 1593112370347
// fqt: 0 1
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