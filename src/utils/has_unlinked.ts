import { StringObject, TreeObject, FunctionObject } from '@/types/common';
const fs = require('fs')
const path = require('path')
const urlModel: TreeObject = global.$urlModel
const allStocks = require(global.$path.db.base_data).data
const marketMap: StringObject = { '1': 'sh', '2': 'sz' } // sh: 上海交易所 sz: 深圳交易所
const spillMap: FunctionObject = {
  deal: spillPeerDealApi,
  kline: spillStockHomeLink,
  quote: spillStockHomeLink
}

/**
 * 根据本地库是否缺省某个票的某日数据
 * @param { String } dataPath
 * @param { String } chart ['deal' | 'kline', 'quote']
 * @return { Array<String> } ['http://xxxx', 'http://xxxx']
 * @template hasUnlinked('deals/2021-06-25', 'deals') => ['http://quote.eastmoney.com/f1.html?code=xxxxxx&market=1', ...]
 * @template hasUnlinked('fr-klines/2021-06-25', 'klines') => ['http://quote.eastmoney.com/1xxxxxx.html', ...]
 */
export default function hasUnlinked(dataPath: string, chart: string): string[] {
  const unlinks: string[] = []
  allStocks.forEach((stockItem: StringObject) => {
    if(!fs.existsSync(path.join(global.$path.db.stocks, stockItem.code, dataPath))) {
      const url = spillMap[chart](stockItem)
      console.log('deals url:', url)
      unlinks.push(url)
    }
  })
  return unlinks
}

function spillStockHomeLink (stockItem: StringObject) {
  return urlModel.model.StockHome
    .replace('[marketName]', marketMap[stockItem.mCode])
    .replace('[stockCode]', stockItem.code)
}

function spillPeerDealApi (stockItem: StringObject) {
  return urlModel.model.PeerDeal
    .replace('[marketCode]', stockItem.mCode)
    .replace('[stockCode]', stockItem.code)
}
