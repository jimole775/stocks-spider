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

module.exports = function hasUnlinks(fileMode) {
  const unlinks = []
  allStocks.forEach((stockItem) => {
    if(!fs.existsSync(path.join(global.db_stocks, stockItem.code, fileMode))) {
      unlinks.push(urlModel.model.StockHome
        .replace('[marketName]', stockItem.marketName)
        .replace('[stockCode]', stockItem.code))
    }
  })
  return unlinks
}