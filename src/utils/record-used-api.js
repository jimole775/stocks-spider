const writeFileSync = require('./write-file-sync')
module.exports = async function recordUsedApi (apiMap, apiKey) {
  const allStocks = require(global.baseData).data
  const newStocks = allStocks.map(stockItem => {
    stockItem[apiKey] = apiMap[stockItem.code]
    return stockItem
  })
  await writeFileSync(global.baseData, { date: global.finalDealDate, data: newStocks })
  return Promise.resolve(allStocks)
}