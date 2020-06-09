/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const path = require('path')
const querystring = require('querystring')
const recordKlines = require(`./record-klines`)
const { readFileAsync, BunchLinking, hasUninks, removeSilingDir, recordUsedAPI } = require(`${global.srcRoot}/utils`)
const baseData = require(global.baseDataFile).data
const allStocks = JSON.parse(baseData ? baseData : [])
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)

// const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
// const recordPathDate = path.join(recordPath, global.finalDealDate)

// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const formerRecordPath = `${global.srcRoot}/db/warehouse/former-daily-klines/`
const formerRecordPathDate = path.join(formerRecordPath, global.finalDealDate)

module.exports = async function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(s, j) {
  console.log(typeof allStocks)
  const urls = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })

  const unlinkedUrls = hasUninks(urls, formerRecordPathDate)
  console.log('klines unlinkedUrls:', unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return s(true)
  if (unlinkedUrls.length === urls.length) {
    // 1. 没有当日目录，新建当日目录，干掉其他旧目录
    removeSilingDir(formerRecordPathDate)
  }

  // 如果所有的link都已经记录在baseData中，
  // 就直接读取，不用再去每个网页爬取，浪费流量
  if (hasFullRecordInbaseData(allStocks, 'FRKlineApi')) {
    allStocks.forEach((stockItem) => {
      recordKlines(stockItem.FRKlineApi)
    })
  } else {
    // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
    const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)
    await recordUsedAPI(doneApiMap, 'FRKlineApi')
  }
  return s(true)
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
  await bunchLinking.on({
    response: function (response) {
      if (response.status() === 200 && dailyKlineReg.test(response.url())) {
        const apiObj = querystring.decode(response.url())
        const stockCode = apiObj.secid.split('.').pop() // secid: '1.603005',
        apiObj.lmt = 99999 // lmt: '120',
        apiObj.fqt = 1 // fqt: '0'-不复权，'1'-前复权,
        const FRKlineApi = querystring.encode(apiObj)
        doneApiMap[stockCode] = FRKlineApi
        return recordKlines(stockCode, FRKlineApi)
      }
    },
    end: function () {
      return hasUninks(unlinkedUrls, formerRecordPath)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}
