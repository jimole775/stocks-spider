const path = require(`path`)
const uri = require(`./uri`)
const { quest, writeFileSync } = global.$utils
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const dataPath = `quotes/${global.$finalDealDate}.json`
module.exports = async function recordQuotes (recordItem) {
  return new Promise((resolve, reject) => executes(recordItem, resolve, reject, 0))
}

/**
 * 递归函数
 * @param {Object} recordItem 分解api得来的对象
 * @param {Function} resolve Promise的参数
 * @param {Function} reject Promise的参数
 * @param {Number} loopTimes 递归次数
 * @returns Promise.resolve
 */
async function executes (recordItem, resolve, reject, loopTimes) {
  try {
    await handleRecord(recordItem)
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return reject() // 超过30次都不能成功quest，就直接跳过
    console.error('record-klines error:', error)
    return setTimeout(() => executes(recordItem, resolve, reject, ++loopTimes), 1000)
  }
}

async function handleRecord (recordItem) {
  const { stock, api } = uri.spill({ ...recordItem })
  const file = path.join(global.$path.db.stocks, stock, dataPath)
  const dirtyData = await quest(api) // 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.data.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  writeFileSync(file, pureData.data ? pureData.data : {})
  return Promise.resolve()
}
