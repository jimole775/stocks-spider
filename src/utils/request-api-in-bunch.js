const allStocks = require(global.baseData).data
module.exports = function requestApiInBunch (apikey, unlinkedUrls, task) {
  return new Promise((resolve) => {
    const unLinkStocks = []
    allStocks.forEach((stockItem) => {
      for (let i = 0; i < unlinkedUrls.length; i++) {
        const urlItem = unlinkedUrls[i]
        if (urlItem.includes(stockItem.code) && stockItem[apikey]) {
          unLinkStocks.push(stockItem)
          unlinkedUrls.splice(i, 1)
          break
        }
      }
    })
    
    const bunch = new BunchThread()
    unLinkStocks.forEach((stockItem) => {
      bunch.taskCalling(() => {
        return new Promise(async (resolve) => {
          return resolve(await task(stockItem))
        })
      })
    })

    bunch.finally(() => {
      console.log('kline requestApiInBunch end!')
      return resolve(unlinkedUrls)
    })
  })
}