/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const moment = require('moment')
const querystring = require('querystring')
const baseData = require(global.baseDataFile).data
const allStocks = JSON.parse(baseData ? baseData : [])
const recordPeerDeal = require('./record-peer-deal')
const { readFileAsync, BunchLinking, hasUninks, recordUsedAPI, hasFullRecordInbaseData } = require(`${global.srcRoot}/utils`)
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const recordDir = `${global.srcRoot}/db/warehouse/peer-deals/${global.finalDealDate}`

module.exports = function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (s, j) {
  // if (!canContinue()) return s(true)
  console.log(typeof allStocks)
  const urls = allStocks.map(item => {
    return urlModel.model.PeerDeal
      .replace('[stockCode]', item.code)
      .replace('[marketCode]', item.marketCode)
  })
  const unlinkedUrls = hasUninks(urls, recordDir)
  console.log('daily deals unlink: ', unlinkedUrls.length)
  // 每日交易详情会以日期为目录区分，
  // 所以，如果当前目录的文件数如果饱和，没必要再进行抓取
  if (unlinkedUrls.length === 0) return s(true)

  // 如果所有的link都已经记录在baseData中，
  // 就直接读取，不用再去每个网页爬取，浪费流量
  if (hasFullRecordInbaseData(allStocks, 'dealApi')) {
    allStocks.forEach((stockItem) => {
      recordPeerDeal(stockItem.dealApi)
    })
  } else {
    // 如果 baseData 中没有足够的link，就跑 sniffUrlFromWeb
    const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)
    await recordUsedAPI(doneApiMap, 'dealApi')
  }
  return s(true)
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking
    .on({
      response: function (response) {
        if (response.status() === 200 && peerDealReg.test(response.url())) {
          const api = response.url()
          const base = api.split('?')[0]
          const query = api.split('?')[1]
          const queryObj = querystring.decode(query)
          const stockCode = queryObj.code
          queryObj.pagesize = 99999
          const apiEncode = `${base}?${querystring.encode(queryObj)}`
          doneApiMap[stockCode] = apiEncode
          return recordPeerDeal(stockCode, apiEncode)
        }
      },
      end: function () {
        return hasUninks(urls, recordDir)
      }
    })
    .emit()
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

// function hasFullRecordInbaseData (allStocks, apiKey) {
//   const linkSum = allStocks.length
//   const linkCount = 0
//   allStocks.forEach((stockItem) => {
//     if (stockItem[apiKey]) {
//       linkCount ++
//     }
//   })
//   return linkSum === linkCount
// }

// async function recordAPI (apiMap) {
//   allStocks.map(stockItem => {
//     stockItem.dealApi = apiMap[stockItem.code]
//     return stockItem
//   })
//   await writeFileAsync(global.baseDataFile, { date: global.finalDealDate, data: allStocks })
//   return Promise.resolve(allStocks)
// }
