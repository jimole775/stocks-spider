/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const path = require('path')
const querystring = require('querystring')
const recordKlines = require(`./record-klines`)
const {
  readFileSync, BunchLinking, hasUninks,
  recordUsedApi, hasRecordedApis,
  BunchThread
} = require(global.utils)
const allStocks = require(global.baseData).data
const urlModel = readFileSync(`${global.srcRoot}/url-model.yml`)

const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
const recordPathDate = path.join(recordPath, global.finalDealDate)

// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const formerRecordPath = `${global.srcRoot}/db/warehouse/former-daily-klines/`
const formerRecordPathDate = path.join(formerRecordPath, global.finalDealDate)

module.exports = function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(resolve) {
  const urls = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })

  let unlinkedUrls = hasUninks(urls, recordPathDate)
  console.log('klines unlinkedUrls:', unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return resolve(true)
  // 如果所有的link都已经记录在baseData中，
  // 就直接读取，不用再去每个网页爬取，浪费流量
  if (hasRecordedApis(allStocks, 'klineApi')) {
    unlinkedUrls = await requestApiInBunch(allStocks, unlinkedUrls)
  }
  
  if (unlinkedUrls.length === 0) return resolve(true)
  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)
  await recordUsedApi(doneApiMap, 'klineApi')
    
  return resolve(true)
}

async function requestApiInBunch (allStocks, unlinkedUrls) {
  return new Promise((resolve, reject) => {
    const unLinkStocks = []
    allStocks.forEach((stockItem) => {
      for (let i = 0; i < unlinkedUrls.length; i++) {
        const urlItem = unlinkedUrls[i]
        if (urlItem.includes(stockItem.code)) {
          unLinkStocks.push(stockItem)
          unlinkedUrls.splice(i, 1)
          break
        }
      }
    })
    
    const bunch = new BunchThread()
    unLinkStocks.forEach((stockItem) => {
      bunch.taskCalling(() => {
        return new Promise(async (s, j) => {
          const { stockCode, klineApi, FRKlineApi } = transApi(stockItem.klineApi)
          await recordKlines(stockCode, klineApi, FRKlineApi)
          return s()
        })
      })
    })

    bunch.finally(() => {
      console.log('kline requestApiInBunch end!')
      return resolve(unlinkedUrls)
    })
  })
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
  await bunchLinking.on({
    response: function (response) {
      const api = response.url()
      if (response.status() === 200 && dailyKlineReg.test(api)) {
        const { stockCode, klineApi, FRKlineApi } = transApi(api)
        doneApiMap[stockCode] = klineApi
        return recordKlines(stockCode, klineApi, FRKlineApi)
      }
    },
    end: function () {
      return hasUninks(unlinkedUrls, recordPathDate)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}

function transApi (api) {
  const host = api.split('?')[0]
  const query = api.split('?')[1]
  const queryObj = querystring.decode(query)
  const stockCode = queryObj.secid.split('.').pop() // secid: '1.603005',
  queryObj.lmt = global.kline.page_size || 120 // lmt: '120',
  queryObj.fqt = 0 // fqt: '0'-不复权，'1'-前复权,
  const klineApi = `${host}?${querystring.encode(queryObj)}`
  queryObj.fqt = 1 // fqt: '0'-不复权，'1'-前复权,
  const FRKlineApi = `${host}?${querystring.encode(queryObj)}`
  return { stockCode, klineApi, FRKlineApi }
}
