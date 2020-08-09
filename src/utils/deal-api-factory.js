const querystring = require('querystring')
module.exports = function dealApiFactory ({ut, cb, id, _}) {
  // ut: '7eea3edcaed734bea9cbfc24409ed989'
  // cb: 'jQuery112308687412063259543_1592944461518'
  // id: 6039991
  // _: 1592944461519
  const id = record.id + ''
  const market = id.substring(id.length - 1)
  const code = id.substring(0, id.length - 1)
  const defaultQuery = {
    pageindex: 0,
    pagesize: 99999,
    dpt: 'wzfscj',
    sort: 1,
    ft: 1,
    ut, cb, id, _, market, code
  }
  const host = 'push2ex.eastmoney.com/getStockFenShi'
  return `http://${host}?${querystring.encode(defaultQuery)}`
}