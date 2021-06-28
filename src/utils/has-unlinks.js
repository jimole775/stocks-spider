const fs = require('fs')
const path = require('path')
const readFileSync = require('./read-file-sync')
const urlModel = readFileSync(global.urlModel)
const allStocks = require(global.baseData).data
const marketMap = { 1: 'sh', 2: 'sz' } // sh: 上海交易所 sz: 深圳交易所
const typeMap = { deals: spillPeerDealLink, klines: spillStockHomeLink }

/**
 * 根据本地库是否缺省某个票的某日数据
 * @param { String } fileMode
 * @param { String } type ['deals' | 'klines']
 * @return { Array<String> } ['http://xxxx', 'http://xxxx']
 * @template hasUnlinks('deals/2021-06-25', 'deals') => ['http://quote.eastmoney.com/f1.html?code=xxxxxx&market=1', ...]
 * @template hasUnlinks('klines/2021-06-25', 'klines') => ['http://quote.eastmoney.com/1xxxxxx.html', ...]
 */
module.exports = function hasUnlinks(fileMode, type) {
  const unlinks = []
  allStocks.forEach((stockItem) => {
    if(!fs.existsSync(path.join(global.db_stocks, stockItem.code, fileMode))) {
      typeMap[type](unlinks, stockItem)
    }
  })
  return unlinks
}

function spillStockHomeLink (unlinks, stockItem) {
  unlinks.push(urlModel.model.StockHome
    .replace('[marketName]', marketMap[stockItem.mCode])
    .replace('[stockCode]', stockItem.code))
}

function spillPeerDealLink (unlinks, stockItem) {
  unlinks.push(urlModel.model.PeerDeal
    .replace('[marketCode]', stockItem.mCode)
    .replace('[stockCode]', stockItem.code))
}
