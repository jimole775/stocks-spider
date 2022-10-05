import { StringObject } from '@/types/common'

import { writeFileSync } from './write_file_sync'

const allStocks: StringObject[] = require(global.$path.db.base_data).data

/**
 * 存储已抓取的api，以免下次抓取的时候还要从主页探测
 * @param { String } apiKey 当前的key有两个 'dealApi', 'klineApi'
 * @param { Object | Map } apiMap
 * @return { undefined }
 */
export function recordUsedApi (apiKey: string, apiMap: StringObject): Promise<void> {
  allStocks.forEach(stockItem => {
    if (apiMap[stockItem.code]) {
      stockItem[apiKey] = apiMap[stockItem.code]
    }
  })
  writeFileSync(global.$path.db.base_data, { date: global.$finalDealDate, data: allStocks })
  return Promise.resolve()
}
