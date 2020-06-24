const writeFileSync = require('./write-file-sync')
const allStocks = require(global.baseData).data
module.exports = function recordUsedApi (apiMap, apiKey) {
  allStocks.forEach(stockItem => {
    if (apiMap[stockItem.code]) {
      stockItem[apiKey] = apiMap[stockItem.code]
    }
  })
  writeFileSync(global.baseData, { date: global.finalDealDate, data: allStocks })
  return Promise.resolve()
}