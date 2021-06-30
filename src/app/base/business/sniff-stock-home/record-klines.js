const path = require(`path`)
const { quest, writeFileSync, klineApiFactory } = require(global.utils)
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const fileMode = `klines/daily/${global.finalDealDate}.json`
const fileMode_week = `klines/week/${global.finalDealDate}.json`
const fileMode_month = `klines/month/${global.finalDealDate}.json`
const fr_fileMode = `/fr-klines/daily/${global.finalDealDate}.json`
const fr_fileMode_week = `/fr-klines/week/${global.finalDealDate}.json`
const fr_fileMode_month = `/fr-klines/month/${global.finalDealDate}.json`
module.exports = async function recordKlines (recordItem) {
  return new Promise((resolve, reject) => executes(recordItem, resolve, reject, 0))
}

async function executes (recordItem, resolve, reject, loopTimes) {
  try {
    await pickKline(recordItem)
    await pickFRKline(recordItem)
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return reject() // 超过30次都不能成功quest，就直接跳过
    console.error('record-klines error:', error)
    return setTimeout(() => executes(recordItem, resolve, reject, ++loopTimes), 1000)
  }
}

// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
async function pickKline (recordItem) {
  const { stockCode, klineApi_daily, klineApi_week, klineApi_month } = klineApiFactory({ fqt: 0, ...recordItem })
  const file = path.join(global.db_stocks, stockCode, fileMode)
  // const file_week = path.join(global.db_stocks, stockCode, fileMode_week)
  // const file_month = path.join(global.db_stocks, stockCode, fileMode_month)
  await handleRecord(file, klineApi_daily)
  // await handleRecord(file_week, klineApi_week)
  // await handleRecord(file_month, klineApi_month)
  return Promise.resolve()
}

async function pickFRKline (recordItem) {
  const { stockCode, klineApi_daily, klineApi_week, klineApi_month } = klineApiFactory({ fqt: 1, ...recordItem })
  const file = path.join(global.db_stocks, stockCode, fr_fileMode)
  // const file_week = path.join(global.db_stocks, stockCode, fr_fileMode_week)
  // const file_month = path.join(global.db_stocks, stockCode, fr_fileMode_month)
  await handleRecord(file, klineApi_daily)
  // await handleRecord(file_week, klineApi_week)
  // await handleRecord(file_month, klineApi_month)
  return Promise.resolve()
}

async function handleRecord (file, api) {
  // 修改数据的请求数量
  const dirtyData = await quest(api) // 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  writeFileSync(file, pureData.data ? pureData.data : {})
  return Promise.resolve()
}
