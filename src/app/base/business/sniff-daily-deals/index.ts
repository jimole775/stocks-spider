/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
import recordDeals from './record-deals'
import recordDeals1 from './record-deals1'
import sniffApiFromWebsite from './sniff-api-from-website'
import { ApiStore, StockStoreModel } from '@/types/stock'


export default function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution (resolve: Function, reject: Function) {
  const dataPath = `deals/${global.$finalDealDate}.json`
  const { hasUnlinked, recordUsedApi, requestApiInBunch } = global.$utils
  // 获取 deals 交易详情主页的地址
  let unlinkedURLs = hasUnlinked(dataPath, 'deal')

  if (unlinkedURLs.length === 0) return resolve(0)
  console.log('daily deals unlink: ', unlinkedURLs.length)
  console.log('unlink enmure: ', unlinkedURLs[0])

  // 从url中筛选出code，再从 baseData 中拿deals的api
  const neverLinedURLs = await requestApiInBunch('dealApi', unlinkedURLs, async (stockItem: StockStoreModel) => {
    try {
      const dealApi: ApiStore = stockItem['dealApi'] as ApiStore
      if (dealApi && dealApi['dt'] === 0) {
        await recordDeals(dealApi)
      }
      if (dealApi && dealApi['dt'] === 1) {
        await recordDeals1(dealApi)
      }
      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  })

  if (neverLinedURLs.length === 0) return resolve(0)
  console.log('daily deals neverLinedURLs: ', neverLinedURLs.length)
  console.log('neverLinedURLs enmure: ', neverLinedURLs[0])

  // 如果 baseData 中没有api，就跑 sniffApiFromWebsite，从deal的主页去嗅探api
  // todo 这里会造成 `MaxListenersExceededWarning` 错误
  const doneApiMap = await sniffApiFromWebsite(neverLinedURLs)

  // 最后把api存起来
  await recordUsedApi('dealApi', doneApiMap)
  return resolve()
}
