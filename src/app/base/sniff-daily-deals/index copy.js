/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const moment = require('moment')
const baseData = require(global.baseDataFile).data
const allStocks = JSON.parse(baseData ? baseData : [])
const recordPeerDeal = require('./record-peer-deal')
const { readFileAsync, BunchLinking, hasUninks } = require(`${global.srcRoot}/utils`)
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const recordDir = `${global.srcRoot}/db/warehouse/peer-deals/${global.finalDealDate}`

module.exports = async function sniffDailyDeals() {
  if (!canContinue()) return Promise.resolve(true)
  const urls = allStocks.map(item => {
    return urlModel.model.PeerDeal
      .replace('[stockCode]', item.code)
      .replace('[marketCode]', item.marketCode)
  })
  const unlinks = hasUninks(urls, recordDir)
  console.log('daily deals unlink: ', unlinks.length)
  // 每日交易详情会以日期为目录区分，
  // 所以，如果当前目录的文件数如果饱和，没必要再进行抓取
  if (unlinks.length) {
    const bunchLinking = new BunchLinking(unlinks)
    await bunchLinking
      .on({
        response: function (response) {
          if (response.status() === 200 && peerDealReg.test(response.url())) {
            return recordPeerDeal(response)
          }
        },
        end: function () {
          return hasUninks(urls, recordDir)
        }
      })
      .emit()
  }
  return Promise.resolve(true)
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
