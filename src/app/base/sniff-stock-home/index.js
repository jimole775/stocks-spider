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
  readFileSync, BunchLinking, hasUnlinks,
  recordUsedApi, requestApiInBunch
} = require(global.utils)

const urlModel = readFileSync(global.urlModel)

const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
const recordPathDate = path.join(recordPath, global.finalDealDate)

module.exports = function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(resolve) {

  let unlinkedUrls = hasUnlinks(recordPathDate)
  console.log('klines unlinkedUrls:', unlinkedUrls.length)

  if (unlinkedUrls.length === 0) return resolve(true)

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch('klineApi', unlinkedUrls, async (stockItem) => {
    try {
      const { stockCode, klineApi, FRKlineApi } = transApi(stockItem['klineApi'])
      await recordKlines(stockCode, klineApi, FRKlineApi)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })
  
  console.log('remain klines unlinkedUrls:', unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return resolve(true)

  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)

  // 把api存起来
  await recordUsedApi(doneApiMap, 'klineApi')

  return resolve()
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  const dailyKlineReg = new RegExp(urlModel.api.dailyKlineReg, 'ig')
  await bunchLinking.on({
    response: async function (response) {
      const api = response.url()
      if (response.status() === 200 && dailyKlineReg.test(api)) {
        const { stockCode, klineApi, FRKlineApi } = transApi(api)
        doneApiMap[stockCode] = klineApi
        return await recordKlines(stockCode, klineApi, FRKlineApi)
      }
    },
    end: function () {
      return hasUnlinks(recordPathDate)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}

function transApi (api) {
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  const stockCode = queryObj.secid.split('.').pop() // secid: '1.603005',
  queryObj.lmt = global.kline.page_size || 120 // lmt: '120',
  queryObj.fqt = 0 // fqt: '0'-不复权，'1'-前复权,
  const klineApi = `${host}?${querystring.encode(queryObj)}`
  queryObj.fqt = 1 // fqt: '0'-不复权，'1'-前复权,
  const FRKlineApi = `${host}?${querystring.encode(queryObj)}`
  return { stockCode, klineApi, FRKlineApi }
}
