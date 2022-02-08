/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const querystring = require('querystring')
const {
  readFileSync, BunchLinking, hasUnlinked,
  recordUsedApi, requestApiInBunch
} = require(global.utils)

const urlModel = readFileSync(global.urlModel)

const business = {
  kline: {
    api: 'klineApi',
    decompose: require(`./klines/uri`).decompose,
    dataPath: `fr-klines/daily/${global.finalDealDate}.json`,
    record: require(`./klines/record`),
    reg: new RegExp(urlModel.api.dailyKlineReg, 'ig')
  },
  quote: {
    api: 'quoteApi',
    decompose: require(`./quote/uri`).decompose,
    dataPath: `quote/${global.finalDealDate}.json`,
    record: require(`./quote/record`),
    reg: new RegExp(urlModel.api.quetoReg, 'ig')
  }
}

/**
 * 业务类型：K线|报价表
 * @param {String} chart klines|quote
 * @returns Promise
 */
module.exports = function sniffStockHome(chart) {
  return new Promise((resolve) => excution(resolve, chart)).catch(err => err)
}

async function excution(resolve, chart) {
  let unlinkedUrls = hasUnlinked(business[chart]['dataPath'], chart)
  console.log(`${chart} unlinkedUrls:`, unlinkedUrls.length)

  if (unlinkedUrls.length === 0) return resolve(0)

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch(business[chart]['api'], unlinkedUrls, async (stockItem) => {
    try {
      console.log(chart, stockItem.code)
      await business[chart]['record'](stockItem[business[chart]['api']])
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })

  console.log(`remain ${chart} unlinkedUrls:`, unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return resolve(0)

  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls, chart)

  // 把api存起来
  await recordUsedApi(apiMap[chart], doneApiMap)

  return resolve()
}

async function sniffUrlFromWeb (unlinkedUrls, chart) {
  const doneApiMap = {}
  const bus = business[chart]
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking.on({
    response: async function (response) {
      const api = response.url()
      if (response.status() === 200) {
        if (bus['reg'].test(api)) {
          const stockItem = bus['decompose'](api)
          const stock = stockItem.stock
          doneApiMap[stock] = stockItem
          console.log('record:', stock)
          return await bus['record'](stockItem)
        }
      }
    },
    end: function () {
      return hasUnlinked(bus['dataPath'], chart)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}
