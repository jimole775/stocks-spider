const path = require('path')
const { writeFileAsync, quest } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/peer-deals/`
module.exports = async function recordPeerDeal(stockCode, url) {
  try {
    // 修改数据的请求数量?pagesize=144&
    const dirtyData = await quest(url.replace(/^(http.*?)\?pagesize\=\d*?\&(.*?)$/, '$1?pagesize=99999&$2'))
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    console.log('deal:', stockCode)
    return writeFileAsync(path.join(recordPath, global.finalDealDate, `${stockCode}.json`), pureData.data.data)
  } catch (error) {
    console.error('deal error:', error)
    return false
  }
}