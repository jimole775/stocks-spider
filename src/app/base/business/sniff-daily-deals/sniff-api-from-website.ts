import { ApiStore } from '@/types/stock'
import { BunchLinkingResponse } from '@/utils/bunch_linking'

import querystring from 'querystring'
import recordDeals from './record-deals'
import recordDeals1 from './record-deals1'
/**
 * 从交易详情主页中嗅探 api
 * @param { Array<String> } dealsURLs deals交易详情主页的地址
 */
export default async function sniffApiFromWebSite (dealsURLs: string[]): Promise<any> {
  const { BunchLinking, hasUnlinked } = global.$utils
  const urlModel = global.$urlModel
  const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
  const peerDealReg1 = new RegExp(urlModel.api.peerDealReg1, 'g')
  const dataPath = `deals/${global.$finalDealDate}.json`
  const doneApiMap: {[key: string]: ApiStore } = {}
  const bunchLinking = new BunchLinking(dealsURLs)
  await bunchLinking.on({
    response: async function (response: BunchLinkingResponse) {
      const api = response.url()
      if (response.status() === 200) {
        if (peerDealReg.test(api)) {
          const { code = '', ut, cb, id } = dealAnalyze(api)
          doneApiMap[code] = { ut, cb, id, dt: 0 }
          await recordDeals({ ut, cb, id })
          return Promise.resolve(true)
        } else if (peerDealReg1.test(api)) {
          const { code = '', secid, id } = dealAnalyze(api)
          doneApiMap[code] = { secid, dt: 1 }
          await recordDeals1({ secid })
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false)
        }
      } else {
        return Promise.resolve(false)
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

function dealAnalyze (api: string): ApiStore {
  // ut:'7eea3edcaed734bea9cbfc24409ed989'
  // cb:'jQuery112308687412063259543_1592944461518'
  // id:6039991
  const [host, query] = api.split('?')
  const queryObj: ApiStore = querystring.decode(query)
  const code = queryObj.code
  const code1 = queryObj.secid && queryObj.secid.split('.').pop()
  const code2 = queryObj.id && queryObj.id.substring(0, queryObj.id.length - 1)
  return {
    ut: queryObj.ut,
    cb: queryObj.cb,
    id: queryObj.id,
    code: code || code1 || code2,
    secid: queryObj.secid
  }
}
