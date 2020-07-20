const path = require(`path`)
const { quest, writeFileSync, klineApiFactory } = require(global.utils)
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const fileMode = `/daily-klines/${global.finalDealDate}.json`
const fileMode_week = `/week-klines/${global.finalDealDate}.json`
const fileMode_month = `/month-klines/${global.finalDealDate}.json`
// const former_fileMode = `/former-daily-klines/${global.finalDealDate}.json`
module.exports = async function recordKlines (klineApi) {
  return new Promise((resolve, reject) => executes(klineApi, resolve, reject, 0))
}

async function executes (klineApi, resolve, reject, loopTimes) {
  try {
    const { stockCode, klineApi_week, klineApi_month } = klineApiFactory(klineApi)
    console.log('kline:', stockCode)
    const file = path.join(global.db_stocks, stockCode, fileMode)
    const file_week = path.join(global.db_stocks, stockCode, fileMode_week)
    const file_month = path.join(global.db_stocks, stockCode, fileMode_month)
    // const FRFile = path.join(global.db_stocks, stockCode, former_fileMode)
    await handleRecord(file, klineApi)
    await handleRecord(file_week, klineApi_week)
    await handleRecord(file_month, klineApi_month)
    // await handleRecord(FRFile, FRKlineApi)
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return reject() // 超过30次都不能成功quest，就直接跳过
    console.error('record-klines error:', error)
    return setTimeout(() => executes(klineApi, resolve, reject, ++loopTimes), 1000)
  }
}

async function handleRecord (file, api) {
  // 修改数据的请求数量
  const dirtyData = await quest(api) // 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  await writeFileSync(file, pureData.data ? pureData.data : {})
  return Promise.resolve()
}
