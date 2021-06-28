const querystring = require('querystring')
/**
 * deal的api的拼装函数
 * @param {Object|Map} param get类型的参数，这些参数都是预存在base.json里的
 * @return {String}
 */
module.exports = function dealApiFactory ({ ut, cb, id, _ }) {
  // id: 股票代码 + 股票市场 6000011
  // cb: jsonp的回调名
  // ut: 用户token
  // _: 时间戳
  id = id + ''
  const id_market_dict = { 2: 0, 1: 1 }
  const market = id_market_dict[id.substring(id.length - 1)]
  const code = id.substring(0, id.length - 1)
  const defaultQuery = {
    pageindex: 0,
    pagesize: 99999,
    dpt: 'wzfscj',
    sort: 1, // 正序
    ft: 1,
    ut, cb, id, _, market, code
  }
  const host = 'push2ex.eastmoney.com/getStockFenShi'
  return `http://${host}?${querystring.encode(defaultQuery)}`
}
