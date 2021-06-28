/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const querystring = require('querystring')
const recordPeerDeal = require('./record-deals')
const {
  readFileSync, BunchLinking, hasUnlinks,
  recordUsedApi, requestApiInBunch
} = require(global.utils)

const urlModel = readFileSync(global.urlModel)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const fileMode = `deals/${global.finalDealDate}.json`

module.exports = function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (resolve, reject) {

  let unlinkedUrls = hasUnlinks(fileMode, 'deals')
  console.log('daily deals unlink: ', unlinkedUrls.length)
  
  if (unlinkedUrls.length === 0) return resolve(0)
  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch('dealApi', unlinkedUrls, async (stockItem) => {
    try {
      console.log('deal:', stockItem.code)
      await recordPeerDeal(stockItem['dealApi'])
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })
  if (unlinkedUrls.length === 0) return resolve(0)

  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls)

  // 把api存起来
  await recordUsedApi('dealApi', doneApiMap)
  return resolve()
}

async function sniffUrlFromWeb (unlinkedUrls) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking.on({
      response: async function (response) {
        const api = response.url()
        if (response.status() === 200 && peerDealReg.test(api)) {
          // const [host, query] = api.split('?')
          // const queryObj = querystring.decode(query)
          // const apiEncode = `${host}?${querystring.encode(queryObj)}`
          const { code, ut, cb, id, _ } = dealAnalyze(api)
          doneApiMap[code] = { ut, cb, id, _ }
          return await recordPeerDeal({ ut, cb, id, _ })
        }
      },
      end: function () {
        return hasUnlinks(fileMode, 'deals')
      }
    }).emit()
  return Promise.resolve(doneApiMap)
}

function dealAnalyze (api) {
  // ut:'7eea3edcaed734bea9cbfc24409ed989'
  // cb:'jQuery112308687412063259543_1592944461518'
  // id:6039991
  // _:1592944461519
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)

  return {
    code: queryObj.code,
    ut: queryObj.ut,
    cb: queryObj.cb,
    id: queryObj.id,
    _: queryObj._
  }
}