const fs = require('fs')
const path = require('path')
const readDirSync = require('./src/utils/read-dir-sync')
const buildPath = require('./src/utils/build-path')
const readdir = 'G:\\my_db\\stocks-spider\\'
const querystring = require('querystring')
const base = require(path.join(readdir, 'base-bak.json'))
const newItems = []
base.data.forEach((item) => {
  newItems.push({
    code: item.code,
    mCode: item.marketCode,
    klineApi: klineAnlyze(item.klineApi),
    dealApi: dealAnalyze(item.dealApi)
  })
})
fs.writeFileSync(path.join(readdir, 'base.json'), JSON.stringify({
  date: base.date,
  data: newItems
}))

function klineAnlyze (api) {
  // cb: 'jQuery112403637119003265299_1593112370285'
  // ut: 'fa5fd1943c7b386f172d6893dbfba10b'
  // klt: 101
  // _: 1593112370347
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  // const code = queryObj.secid.split('.').pop() // secid: '1.603005',
  return {
    cb: queryObj.cb,
    ut: queryObj.ut,
    secid: queryObj.secid
  }
}

'http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287,f292&secid=0.003028&cb=jQuery112403634220054662962_1644417993889&_=1644417993890'
'http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f138,f139,f141,f142,f144,f145,f147,f148&secid=0.003028&cb=jQuery112403634220054662962_1644417993915&_=1644417993916'

function dealAnalyze (api) {
  // ut:'7eea3edcaed734bea9cbfc24409ed989'
  // cb:'jQuery112308687412063259543_1592944461518'
  // id:6039991
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)

  return {
    ut: queryObj.ut,
    cb: queryObj.cb,
    id: queryObj.id
  }
}
