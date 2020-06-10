const path = require(`path`)
const { quest, writeFileAsync } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const formerRecordPath = `${global.srcRoot}/db/warehouse/former-daily-klines/`
module.exports = function recordKlines (stockCode, FRLink) {
  try {
    const file = path.join(recordPath, global.finalDealDate, stockCode + '.json')
    const FRFile = path.join(formerRecordPath, global.finalDealDate, stockCode + '.json')
    // handleRecord(file, url)
    handleRecord(FRFile, FRLink)
  } catch (error) {
    console.error('record-klines error:', error)
    return false
  }
}

async function handleRecord (file, link) {
  // 修改数据的请求数量
  const dirtyData = await quest(link) || 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  return writeFileAsync(file, pureData.data.klines)
}
