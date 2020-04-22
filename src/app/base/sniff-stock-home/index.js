/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { recordKlines } = require(`./record-klines`)
const { readFile, batchLinkC, hasUninks, hasRefreshLinks } = require(`${global.srcRoot}/utils`)
export async function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(s, j) {
  const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
  const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
  const recordDir = `${global.srcRoot}/db/warehouse/daily-klines/`
  const baseData = readFile(`${global.srcRoot}/db/warehouse/base.json`)
  const allStocks = JSON.parse(baseData ? baseData.data : {})
  const urls = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })
  const unlinks = hasUninks(urls, recordDir)
  const refreshLinks = hasRefreshLinks(urls, recordDir)
  console.log('klines unlinks:', unlinks.length)
  console.log('klines refreshLinks:', refreshLinks.length)
  const links = unlinks.concat(refreshLinks)
  if (links.length) {
    await batchLinkC(links, {
      onResponse: function(response) {
        if (response.status() === 200 && dailyKlineReg.test(response.url())) {
          recordKlines(response)
        }
      },
      onBatchEnd: function () {
        return hasUninks(urls, recordDir).concat(hasRefreshLinks(urls, recordDir))
      }
    })
  }
  return s(true)
}
