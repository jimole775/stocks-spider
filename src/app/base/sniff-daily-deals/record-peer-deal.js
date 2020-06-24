/**
 * return:
 * [
 *  {
 *    t: 1234,
 *    p: 1234,
 *    v: 1234,
 *    bs: 1234, // 交易类型'1'：卖出，'2'：买入，'4'：竞价
 *  }
 * ]
 */
const path = require('path')
const { writeFileSync, quest } = require(global.utils)
const recordPath = `${global.srcRoot}/db/warehouse/peer-deals/`
module.exports = async function recordPeerDeal(stockCode, api) {
  return new Promise((resolve) => excutes(stockCode, api, resolve, 0))
}

async function excutes (stockCode, api, resolve, loopTimes) {
  try {
    console.log('deal:', stockCode)
    // 修改数据的请求数量?pagesize=144&
    const adjustToMax = api.replace(/^(http.*?)\?pagesize\=\d*?\&(.*?)$/, '$1?pagesize=99999&$2')
    const dirtyData = await quest(adjustToMax) || 'jquey_123456({"data":{"data":[]}});'
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    const file = path.join(recordPath, global.finalDealDate, `${stockCode}.json`)
    await writeFileSync(file, pureData.data ? pureData.data : {})
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return resolve() // 超过30次都不能成功quest，就直接跳过
    console.error('record-peer-deal error:', stockCode, error)
    return setTimeout(() => excutes(stockCode, api, resolve, ++loopTimes), 1000)
  }
}
