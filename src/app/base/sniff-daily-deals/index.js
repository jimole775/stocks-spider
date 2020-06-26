/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const moment = require('moment')
const querystring = require('querystring')
const recordPeerDeal = require('./record-peer-deal')
const {
  readFileSync, BunchLinking, hasUnlinks,
  recordUsedApi, requestApiInBunch
} = require(global.utils)
const urlModel = readFileSync(global.urlModel)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const recordDir = `${global.db}/warehouse/peer-deals/${global.finalDealDate}`

module.exports = function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (resolve, reject) {

  let unlinkedUrls = hasUnlinks(recordDir)
  console.log('daily deals unlink: ', unlinkedUrls.length)
  
  if (unlinkedUrls.length === 0) return resolve(true)

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch('dealApi', unlinkedUrls, async (stockItem) => {
    try {
      await recordPeerDeal(stockItem.code, stockItem.dealApi)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })

  if (unlinkedUrls.length === 0) return resolve(true)

  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)

  // 把api存起来
  await recordUsedApi(doneApiMap, 'dealApi')
  return resolve()
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking.on({
      response: async function (response) {
        const api = response.url()
        if (response.status() === 200 && peerDealReg.test(api)) {
          const [host, query] = api.split('?')
          const queryObj = querystring.decode(query)
          const stockCode = queryObj.code
          queryObj.pagesize = 99999
          const apiEncode = `${host}?${querystring.encode(queryObj)}`
          doneApiMap[stockCode] = apiEncode
          return await recordPeerDeal(stockCode, apiEncode)
        }
      },
      end: function () {
        return hasUnlinks(recordDir)
      }
    }).emit()
  return Promise.resolve(doneApiMap)
}

function canContinue() {
  const pass = true
  const curDate = moment(new Date()).format('YYYY-MM-DD')
  // 如果最后的交易日是APP运行的当天，那么，15点钟收盘之前，recordPeerDeal都不要运行
  // 这样做可以让 星期六 的任何时间都可以正常运行 recordPeerDeal
  if (global.finalDealDate === curDate && new Date().getHours() < 15) {
    pass = false
  }
  return pass
}
