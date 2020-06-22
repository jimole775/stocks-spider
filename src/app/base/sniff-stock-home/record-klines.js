const path = require(`path`)
const { quest, writeFileSync } = require(global.utils)
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const formerRecordPath = `${global.srcRoot}/db/warehouse/former-daily-klines/`
module.exports = async function recordKlines (stockCode, klineApi, FRKlineApi) {
  return new Promise((resolve) => excutes(stockCode, klineApi, FRKlineApi, resolve, 0))
}

function excutes (stockCode, klineApi, FRKlineApi, resolve, loopTimes) {
  try {
    console.log('kline:', stockCode)
    const file = path.join(recordPath, global.finalDealDate, stockCode + '.json')
    const FRFile = path.join(formerRecordPath, global.finalDealDate, stockCode + '.json')
    await handleRecord(file, klineApi)
    // await handleRecord(FRFile, FRKlineApi)
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return resolve() // 超过30次都不能成功quest，就直接跳过
    console.error('record-klines error:', stockCode, error)
    return setTimeout(() => excutes(stockCode, klineApi, FRKlineApi, resolve, ++loopTimes), 1000)
  }
}

async function handleRecord (file, link) {
  // 修改数据的请求数量
  const dirtyData = await quest(link) // 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  await writeFileSync(file, pureData.data ? pureData.data : {})
  return Promise.resolve()
}
