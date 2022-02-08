const fs = require('fs')
const path = require('path')
const readFileSync = require('./read-file-sync')
const urlModel = readFileSync(global.urlModel)
const allStocks = require(global.baseData).data
const marketMap = { 1: 'sh', 2: 'sz' } // sh: 上海交易所 sz: 深圳交易所
const spillMap = {
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
module.exports = function hasUnlinked(dataPath, chart) {
  const unlinks = []
  allStocks.forEach((stockItem) => {
    if(!fs.existsSync(path.join(global.db_stocks, stockItem.code, dataPath))) {
      unlinks.push(spillMap[chart](stockItem))
    }
  })
  return unlinks
}

function spillStockHomeLink (stockItem) {
  return urlModel.model.StockHome
    .replace('[marketName]', marketMap[stockItem.mCode])
    .replace('[stockCode]', stockItem.code)
}

function spillPeerDealApi (stockItem) {
  return urlModel.model.PeerDeal
    .replace('[marketCode]', stockItem.mCode)
    .replace('[stockCode]', stockItem.code)
}
