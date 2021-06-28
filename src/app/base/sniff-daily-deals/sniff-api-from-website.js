
const querystring = require('querystring')
const recordDeals = require('./record-deals')
const { BunchLinking, hasUnlinked, readFileSync } = require(global.utils)
const urlModel = readFileSync(global.urlModel)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const fileMode = `deals/${global.finalDealDate}.json`
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
        if (response.status() === 200 && peerDealReg.test(api)) {
          // const [host, query] = api.split('?')
          // const queryObj = querystring.decode(query)
          // const apiEncode = `${host}?${querystring.encode(queryObj)}`
          const { code, ut, cb, id } = dealAnalyze(api)
          doneApiMap[code] = { ut, cb, id }
          return await recordDeals({ ut, cb, id })
        }
      },
      end: function () {
        return hasUnlinked(fileMode, 'deals')
      }
    }).emit()
  return Promise.resolve(doneApiMap)
}

function dealAnalyze (api) {
  // ut:'7eea3edcaed734bea9cbfc24409ed989'
  // cb:'jQuery112308687412063259543_1592944461518'
  // id:6039991
  const [host, query] = api.split('?')
  const queryObj = querystring.decode(query)

  return {
    code: queryObj.code,
    ut: queryObj.ut,
    cb: queryObj.cb,
    id: queryObj.id
  }
}
