const writeFileAsync = require('./write-file-async')
module.exports = async function recordAPI (apiMap, apiKey) {
  const allStocks = require(global.baseDataFile).data
  const newStocks = JSON.parse(allStocks).map(stockItem => {
    stockItem[apiKey] = apiMap[stockItem.code]
    return stockItem
  })
  await writeFileAsync(global.baseDataFile, { date: global.finalDealDate, data: newStocks })
  return Promise.resolve(allStocks)
}