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
const { writeFileAsync, quest } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/peer-deals/`
module.exports = async function recordPeerDeal(stockCode, api) {
  try {
    console.log('deal:', stockCode)
    // 修改数据的请求数量?pagesize=144&
    const adjustToMax = api.replace(/^(http.*?)\?pagesize\=\d*?\&(.*?)$/, '$1?pagesize=99999&$2')
    const dirtyData = await quest(adjustToMax) || 'jquey_123456({"data":{"data":[]}});'
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    const file = path.join(recordPath, global.finalDealDate, `${stockCode}.json`)
    return writeFileAsync(file, pureData.data ? pureData.data.data : [])
  } catch (error) {
    console.error('record-peer-deal error:', error)
    return false
  }
}
