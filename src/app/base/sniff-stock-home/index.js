/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const recordKlines = require(`./record-klines`)
const {
  readFileSync, BunchLinking, hasUnlinks,
  recordUsedApi, requestApiInBunch, klineApiFactory
} = require(global.utils)

const urlModel = readFileSync(global.urlModel)

// const recordPath = `${global.srcRoot}/db/daily-klines/`
// const recordPathDate = path.join(recordPath, global.finalDealDate)
const fileMode = `fr-klines/daily/${global.finalDealDate}.json`

module.exports = function sniffStockHome() {
  return new Promise(excution).catch(err => err)
}

async function excution(resolve) {

  let unlinkedUrls = hasUnlinks(fileMode)
  console.log('klines unlinkedUrls:', unlinkedUrls.length)

  if (unlinkedUrls.length === 0) return resolve(0)

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch('klineApi', unlinkedUrls, async (stockItem) => {
    try {
      const { klineApi } = klineApiFactory(stockItem['klineApi'])
      await recordKlines(klineApi)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })
  
  console.log('remain klines unlinkedUrls:', unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return resolve(0)

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
        const { klineApi } = klineApiFactory(api)
        doneApiMap[stockCode] = klineApi
        return await recordKlines(klineApi)
      }
    },
    end: function () {
      return hasUnlinks(fileMode)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}
