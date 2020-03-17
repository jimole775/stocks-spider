/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
// import puppeteer from 'puppeteer'
const { recordKlines } = require(`./record-klines`)
const { readFile, batchLink } = require(`${global.srcRoot}/utils`)
const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
export function stockHomePage() {
  const baseData = readFile(`${global.srcRoot}/db/warehouse/base.json`)
  const allStocks = JSON.parse(baseData ? baseData.data : {})
  const urls = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })
  batchLink(urls, {
    onResponse: response => {
      if (response.status() === 200 && dailyKlineReg.test(response.url())) {
        recordKlines(response)
      }
    }
  })
}