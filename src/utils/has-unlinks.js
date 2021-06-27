const fs = require('fs')
const path = require('path')
const readFileSync = require('./read-file-sync')
const urlModel = readFileSync(global.urlModel)
const allStocks = require(global.baseData).data
/**
 * links 中，必须包含【股票代码】
 * recordDir 目录下的文件，必须确保能取到【股票代码】
 * @param {*} links  
 * @param {*} recordDir 
 */

const marketMap = { 1: 'sh', 2: 'sz' } // sh: 上海交易所 sz: 深圳交易所
const typeMap = { deals: spillPeerDealLink, klines: spillStockHomeLink }
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