/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { recordKlines } = require(`./record-klines`)
const { readFile, batchLink, hasUnlinkItems } = require(`${global.srcRoot}/utils`)
export function sniffStockHome() {
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
  const unlinkItems = hasUnlinkItems(urls, recordDir)
  console.log('daily-klines:', unlinkItems)
  batchLink(unlinkItems.length ? unlinkItems : urls, {
    onResponse: response => {
      if (response.status() === 200 && dailyKlineReg.test(response.url())) {
        recordKlines(response)
      }
    },
    onEnd: () => {
      const unlinkItems = hasUnlinkItems(urls, recordDir)
      if (unlinkItems.length) batchLink(unlinkItems, this)
    }
  })
}
