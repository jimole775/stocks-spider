const querystring = require('querystring')
module.exports = function klineApiFactory (api, fqt = 0) {
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  const stockCode = queryObj.secid.split('.').pop() // secid: '1.603005',
  queryObj.lmt = global.kline.page_size || 120 // lmt: '120',
  queryObj.fqt = fqt // fqt: '0'-不复权，'1'-前复权,
  queryObj.klt = 101 // klt: 101 日线
  const klineApi = spill(host, queryObj)
  queryObj.klt = 102 // klt: 102 周线
  const klineApi_week = spill(host, queryObj)
  queryObj.klt = 103 // klt: 103 月线
  const klineApi_month = spill(host, queryObj)
  return { stockCode, klineApi_daily, klineApi_week, klineApi_month}
}

function spill (host, queryObj) {
  return `${host}?${querystring.encode(queryObj)}`
}