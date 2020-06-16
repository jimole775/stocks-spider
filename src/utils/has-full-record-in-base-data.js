
module.exports = function hasFullRecordInbaseData (allStocks, apiKey) {
  const linkSum = allStocks.length
  let linkCount = 0
  allStocks.forEach((stockItem) => {
    if (stockItem[apiKey]) {
      linkCount ++
    }
  })
  return linkSum === linkCount
}