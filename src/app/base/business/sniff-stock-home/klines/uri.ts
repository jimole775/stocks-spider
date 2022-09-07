import { CustomObject, StringObject } from '@/types/common';
// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
const querystring = require('querystring')
export function decompose (api: string): StringObject {
  // cb: 'jQuery112403637119003265299_1593112370285'
  // ut: 'fa5fd1943c7b386f172d6893dbfba10b'
  // klt: 101
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  // const code = queryObj.secid.split('.').pop() // secid: '1.603005',
  return {
    cb: queryObj.cb,
    ut: queryObj.ut,
    secid: queryObj.secid,
    code: queryObj.secid.split('.').pop()
  }
}

/**
 * kline的api的拼装函数
 * @param { Object | Map } param get类型的参数，这些参数都是预存在base.json里的
 * @return { Object | Map } { code, daily, week, month }
 */
export function spill ({ secid, cb, ut, fqt = 0 }: CustomObject): StringObject {
  const klineApi_daily = spillEntity({ klt: 101, secid, cb, ut, fqt}) // klt: 101 日线
  const klineApi_week = spillEntity({ klt: 102, secid, cb, ut, fqt}) // klt: 102 周线
  const klineApi_month = spillEntity({ klt: 103, secid, cb, ut, fqt}) // klt: 103 月线
  return { code: secid.split('.').pop(), klineApi_daily, klineApi_week, klineApi_month}
}

// secid: 股票市场 + 股票代码 1.600001
// cb: jsonp的回调名
// ut: 用户token
// _: 时间戳
// fqt: '0'-不复权，'1'-前复权
// klt: k线类型，101=日线，102=周线，103=月线
function spillEntity (record: CustomObject): string {
  const defaultQuery = {
    fields1: 'f1,f2,f3,f4,f5',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    end: 20500101,
    lmt: global.$kline.page_size || 120,
    _: new Date().getTime(),
    ...record
  }
  const protocal = 'http://'
  const host = 'push2his.eastmoney.com'
  const path = '/api/qt/stock/kline/get'
  const serveId = Math.round(Math.random() * 10) + '' + Math.round(Math.random() * 10)
  const params = querystring.encode(defaultQuery)
  return `${protocal}${serveId}.${host}${path}?${params}`
}
