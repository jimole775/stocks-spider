/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const recordKlines = require(`./record-klines`)
const readFileAsync, BunchLinks, hasUninks = require(`${global.srcRoot}/utils`)
const baseData = readFileAsync(`${global.srcRoot}/db/warehouse/base.json`)
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)
const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/${global.finalDealDate}/`
const allStocks = JSON.parse(baseData ? baseData.data : {})

module.exports = async function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(s, j) {
  const urls = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })
  const unlinks = hasUninks(urls, recordPath)
  if (unlinks.length) {
    if (unlinks.length === urls.length) {
      // 1. 没有当日目录，新建当日目录，干掉旧目录

    } else {
      // 2. 当日目录未下载完，继续当日目录
      
    }
  }
  
  // const refreshLinks = hasRefreshLinks(urls, recordPath)
  // console.log('klines refreshLinks:', refreshLinks.length)
  // const links = unlinks.concat(refreshLinks)
  const links = unlinks.length ? unlinks : urls
  console.log('klines unlinks:', links.length)
  // if (unlinks.length) {
  const bunchLinks = new BunchLinks(links)
  await bunchLinks
    .on({
      response: function(response) {
        if (response.status() === 200 && dailyKlineReg.test(response.url())) {
          return recordKlines(response)
        }
      },
      end: function () {
        // return hasUninks(urls, recordPath).concat(hasRefreshLinks(urls, recordPath))
        return hasUninks(urls, recordPath)
      }
    })
    .emit()
  // }
  return s(true)
}
