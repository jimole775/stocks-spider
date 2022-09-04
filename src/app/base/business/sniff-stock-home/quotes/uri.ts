// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
const querystring = require('querystring')
export default function decompose (api):  {
  // https://push2.eastmoney.com/api/qt/stock/get?
  // ut=fa5fd1943c7b386f172d6893dbfba10b
  // &invt=2
  // &fltt=2
  // &fields=f530
  // &secid=0.000651
  // &cb=jQuery112406609094002744729_1644173214139
  // &_=1644173214158
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  return {
    cb: queryObj.cb,
    ut: queryObj.ut,
    secid: queryObj.secid,
    stock: queryObj.secid.split('.').pop()
  }
}
/**
 * quote的api的拼装函数
 * @param { Object | Map } param get类型的参数，这些参数都是预存在base.json里的
 * @return { Object | Map } { stock, api }
 */
// secid: 股票市场 + 股票代码 1.600001
// cb: jsonp的回调名
// ut: 用户token
// _: 时间戳
// invt: 
// fltt: 价格是否现实小数，1=不需要小数点 2=展示小数点
// fields: 展示字段，当前只展示 “f530”
export default function spill ({ secid, cb, ut }) {
  const defaultQuery = {
    fields: 'f530',
    invt: 2,
    fltt: 2,
    _: new Date().getTime(),
    ...{ secid, cb, ut }
  }
  const protocal = 'http://'
  const host = 'push2.eastmoney.com'
  const path = '/api/qt/stock/get'
  const params = querystring.encode(defaultQuery)
  const api = `${protocal}${host}${path}?${params}`
  return { stock: secid.split('.').pop(), api}
}
