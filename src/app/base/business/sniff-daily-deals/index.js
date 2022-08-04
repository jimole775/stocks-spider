/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const recordDeals = require('./record-deals')
const sniffApiFromWebsite = require('./sniff-api-from-website')
const { hasUnlinked, recordUsedApi, requestApiInBunch } = require(global.utils)

const dataPath = `deals/${global.finalDealDate}.json`

module.exports = function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (resolve, reject) {
  // 获取 deals 交易详情主页的地址
  let unlinkedURLs = hasUnlinked(dataPath, 'deal')

  if (unlinkedURLs.length === 0) return resolve(0)
  console.log('daily deals unlink: ', unlinkedURLs.length)
  console.log('unlink enmure: ', unlinkedURLs[0])

  // 从url中筛选出code，再从 baseData 中拿deals的api
  const neverLinedURLs = await requestApiInBunch('dealApi', unlinkedURLs, async (stockItem) => {
    try {
      await recordDeals(stockItem['dealApi'])
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })

  if (neverLinedURLs.length === 0) return resolve(0)
  console.log('daily deals neverLinedURLs: ', neverLinedURLs.length)
  console.log('neverLinedURLs enmure: ', neverLinedURLs[0])

  // 如果 baseData 中没有api，就跑 sniffApiFromWebsite，从deal的主页去嗅探api
  const doneApiMap = await sniffApiFromWebsite(neverLinedURLs)

  // 最后把api存起来
  await recordUsedApi('dealApi', doneApiMap)
  return resolve()
}
