/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const moment = require('moment')
const querystring = require('querystring')
const allStocks = require(global.baseDataFile).data
const recordPeerDeal = require('./record-peer-deal')
const {
  readFileSync, BunchLinking, hasUninks,
  recordUsedApi, hasFullRecordInbaseData,
  BunchThread
} = require(global.utils)
const urlModel = readFileSync(`${global.srcRoot}/url-model.yml`)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const recordDir = `${global.srcRoot}/db/warehouse/peer-deals/${global.finalDealDate}`

module.exports = function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (resolve, reject) {
  // if (!canContinue()) return s(true)
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
    await requestApiInBunch(allStocks)
  } else {
    // 如果 baseData 中没有足够的link，就跑 sniffUrlFromWeb
    const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)
    await recordUsedApi(doneApiMap, 'dealApi')
  }
  return resolve(true)
}
async function requestApiInBunch (allStocks) {
  return new Promise((resovle, reject) => {
    const bunch = new BunchThread(3)
    allStocks.forEach((stockItem) => {
      bunch.taskCalling(() => {
        return new Promise(async (s, j) => {
          await recordPeerDeal(stockItem.code, stockItem.dealApi)
          return s()
        })
      })
    })
    bunch.finally(() => {
      resovle()
    })
  })
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking.on({
      response: function (response) {
        const api = response.url()
        if (response.status() === 200 && peerDealReg.test(api)) {
          const host = api.split('?')[0]
          const query = api.split('?')[1]
          const queryObj = querystring.decode(query)
          const stockCode = queryObj.code
          queryObj.pagesize = 99999
          const apiEncode = `${host}?${querystring.encode(queryObj)}`
          doneApiMap[stockCode] = apiEncode
          return recordPeerDeal(stockCode, apiEncode)
        }
      },
      end: function () {
        return hasUninks(unlinkedUrls, recordDir)
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
