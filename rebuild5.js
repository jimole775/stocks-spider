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
    mcode: item.marketCode,
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
