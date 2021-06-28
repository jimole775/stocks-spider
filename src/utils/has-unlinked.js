const fs = require('fs')
const path = require('path')
const readFileSync = require('./read-file-sync')
const urlModel = readFileSync(global.urlModel)
const allStocks = require(global.baseData).data
const marketMap = { 1: 'sh', 2: 'sz' } // sh: 上海交易所 sz: 深圳交易所
const typeMap = { deals: spillPeerDealApi, klines: spillStockHomeLink }

/**
 * 根据本地库是否缺省某个票的某日数据
 * @param { String } fileMode
 * @param { String } type ['deals' | 'klines']
 * @return { Array<String> } ['http://xxxx', 'http://xxxx']
 * @template hasUnlinked('deals/2021-06-25', 'deals') => ['http://quote.eastmoney.com/f1.html?code=xxxxxx&market=1', ...]
 * @template hasUnlinked('klines/2021-06-25', 'klines') => ['http://quote.eastmoney.com/1xxxxxx.html', ...]
 */
module.exports = function hasUnlinked(fileMode, type) {
  const unlinks = []
  allStocks.forEach((stockItem) => {
    if(!fs.existsSync(path.join(global.db_stocks, stockItem.code, fileMode))) {
      unlinks.push(typeMap[type](stockItem))
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
