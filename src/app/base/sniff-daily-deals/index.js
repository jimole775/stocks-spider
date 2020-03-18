/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
import fs from 'fs'
const { recordPeerDeal } = require('./record-peer-deal')
const { readFile, batchLink, hasUnlinkItems } = require(`${global.srcRoot}/utils`)
const baseData = readFile(`${global.srcRoot}/db/warehouse/base.json`)
const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const allStocks = JSON.parse(baseData ? baseData.data : {})
export async function sniffDailyDeals() {
  const recordDir = `${global.srcRoot}/db/warehouse/peer-deals/${global.finalDate}`
  const urls = allStocks.map(item => {
    return urlModel.model.PeerDeal
      .replace('[stockCode]', item.code)
      .replace('[marketCode]', item.marketCode)
  })

  const unlinkItems = hasUnlinkItems(urls, recordDir)
  console.log('peer-deals', unlinkItems.length)
  // 每日交易详情会以日期为目录区分，
  // 所以，如果当前目录的文件数如果饱和，没必要再进行抓取
  unlinkItems.length && batchLink(unlinkItems, {
    // onLinked: analyzeContent,
    onResponse: response => {
      if (response.status() === 200 && peerDealReg.test(response.url())) {
        recordPeerDeal(response)
      }
    },
    onEnd: () => {
      const unlinkItems = hasUnlinkItems(urls, recordDir)
      if (unlinkItems.length) batchLink(unlinkItems, this)
    }
  })
}
