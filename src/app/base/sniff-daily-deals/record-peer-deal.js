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
    return writeFileAsync(path.join(recordPath, global.finalDealDate, `${stockCode}.json`), pureData.data.data)
  } catch (error) {
    console.error('record-peer-deal error:', error)
    return false
  }
}
