/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
// const querystring = require('querystring')

import { StockStoreModel, UrlModel } from "@/types/stock"
import { decompose as quotesDecompose } from './quotes/uri'
import { decompose as klinesDecompose } from './klines/uri'
import { StringObject } from '@/types/common'
import BunchLinking, { BunchLinkingResponse } from '@/utils/bunch_linking'
const { hasUnlinked, recordUsedApi, requestApiInBunch } = global.$utils

const urlModel: UrlModel = global.$urlModel

type BusinessItem = {
  reg: RegExp
  api: string
  dataPath: string
  record: Function
  decompose: Function
}

const business: {[key: string]: BusinessItem} = {
  kline: {
    api: 'klineApi',
    decompose: klinesDecompose,
    dataPath: `fr-klines/daily/${global.$finalDealDate}.json`,
    record: require(`./klines/record`),
    reg: new RegExp(urlModel.api.dailyKlineReg, 'ig')
  },
  quote: {
    api: 'quoteApi',
    decompose: quotesDecompose,
    dataPath: `quotes/${global.$finalDealDate}.json`,
    record: require(`./quotes/record`),
    reg: new RegExp(urlModel.api.quoteReg, 'ig')
  }
}

/**
 * 业务类型：K线|报价表
 * @param {String} chart klines|quote
 * @returns Promise
 */
export default function sniffStockHome(chart: string): Promise<any> {
  return new Promise((resolve) => excution(resolve, chart)).catch((err: Error) => err)
}

async function excution(resolve: Function, chart: string): Promise<void> {
  let unlinkedUrls: string[] = hasUnlinked(business[chart]['dataPath'], chart)
  console.log(`${chart} unlinkedUrls:`, unlinkedUrls.length)

  if (unlinkedUrls.length === 0) return resolve()

  // 首先从已存储的api中，直接拉取数据，剩下的再去指定的页面拿剩下的api
  unlinkedUrls = await requestApiInBunch(
    business[chart]['api'],
    unlinkedUrls,
    async (stockItem: StockStoreModel) => {
      try {
        console.log(chart, stockItem.code)
        const apiType = business[chart]['api']
        const recordItem = stockItem[apiType as keyof StockStoreModel]
        await business[chart]['record'](recordItem)
        return Promise.resolve()
      } catch (error) {
        return Promise.reject()
      }
    }
  )

  console.log(`remain ${chart} unlinkedUrls:`, unlinkedUrls.length)
  if (unlinkedUrls.length === 0) return resolve()

  // 如果 allStocks 中没有足够的link，就跑 sniffUrlFromWeb
  const doneApiMap = await sniffUrlFromWeb(unlinkedUrls, chart)

  // 把api存起来
  await recordUsedApi(chart, doneApiMap)

  return resolve()
}

async function sniffUrlFromWeb (unlinkedUrls: string[], chart: string) {
  const doneApiMap: {[key: string]: any} = {}
  const bus = business[chart]
  const bunchLinking = new BunchLinking(unlinkedUrls)
  await bunchLinking.on({
    response: async function (response: BunchLinkingResponse) {
      const api = response.url()
      if (response.status() === 200) {
        if (bus['reg'].test(api)) {
          const stockItem: StringObject = bus['decompose'](api)
          const code = stockItem.code
          // 防止网页中的重复接口
          if (!doneApiMap[code]) {
            console.log('record:', code)
            doneApiMap[code] = stockItem
            return await bus['record'](stockItem)
          }
        }
      }
    },
    end: function () {
      return hasUnlinked(bus['dataPath'], chart)
    }
  }).emit()
  return Promise.resolve(doneApiMap)
}
