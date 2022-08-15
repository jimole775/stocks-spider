
const querystring = require('querystring')
const recordDeals = require('./record-deals')
const recordDeals1 = require('./record-deals1')
const { BunchLinking, hasUnlinked, readFileSync } = require(global.utils)
const urlModel = readFileSync(global.urlModel)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const peerDealReg1 = new RegExp(urlModel.api.peerDealReg1, 'g')
const dataPath = `deals/${global.finalDealDate}.json`
/**
 * 从交易详情主页中嗅探 api
 * @param { Array<String> } dealsURLs deals交易详情主页的地址
 */
module.exports = async function sniffApiFromWebSite (dealsURLs) {
  const doneApiMap = {}
  const bunchLinking = new BunchLinking(dealsURLs)
  await bunchLinking.on({
    response: async function (response) {
      const api = response.url()
      if (response.status() === 200) {
        if (peerDealReg.test(api)) {
          const { code, ut, cb, id } = dealAnalyze(api)
          doneApiMap[code] = { ut, cb, id, dt: 0 }
          recordDeals({ ut, cb, id })
        } else if (peerDealReg1.test(api)) {
          const { code, secid, id } = dealAnalyze(api)
          doneApiMap[code] = { secid, dt: 1 }
          recordDeals1({ secid })
        }
      }
    },
    end: function () {
      console.log('完成一个页面的嗅探')
      return hasUnlinked(dataPath, 'deal')
    }
  }).emit()
  console.log('完成所有网页的嗅探！')
  return Promise.resolve(doneApiMap)
}

function dealAnalyze (api) {
  // ut:'7eea3edcaed734bea9cbfc24409ed989'
  // cb:'jQuery112308687412063259543_1592944461518'
  // id:6039991
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)
  const code = queryObj.code
  const code1 = queryObj.secid && queryObj.secid.split('.').pop()
  const code2 = queryObj.id && queryObj.id.substring(0, id.length - 1)
  return {
    ut: queryObj.ut,
    cb: queryObj.cb,
    id: queryObj.id,
    code: code || code1 || code2,
    secid: queryObj.secid
  }
}