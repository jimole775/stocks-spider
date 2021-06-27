/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const recordKlines = require(`./record-klines`)
const querystring = require('querystring')
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
  let unlinkedUrls = hasUnlinks(fileMode, 'klines')
  console.log('klines unlinkedUrls:', unlinkedUrls.length)

  if (unlinkedUrls.length === 0) return resolve(0)

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch('klineApi', unlinkedUrls, async (stockItem) => {
    try {
      console.log('kline', stockItem.code)
      await recordKlines(stockItem['klineApi'])
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
        const { secid, cb, ut, _ } = klineAnalyze(api)
        doneApiMap[secid.split('.').pop()] = { secid, cb, ut, _ }
        return await recordKlines({ secid, cb, ut, _ })
      }
    },
    end: function () {
      return hasUnlinks(fileMode, 'klines')
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}

function klineAnalyze (api) {
  // cb: 'jQuery112403637119003265299_1593112370285'
  // ut: 'fa5fd1943c7b386f172d6893dbfba10b'
  // klt: 101
  // _: 1593112370347
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  // const code = queryObj.secid.split('.').pop() // secid: '1.603005',
  return {
    _: queryObj._,
    cb: queryObj.cb,
    ut: queryObj.ut,
    secid: queryObj.secid
  }
}
