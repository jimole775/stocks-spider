const fs = require('fs')
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
    if(!fs.existsSync(path.join(global.db, stockItem.code, fileMode))) {
      unlinks.push(urlModel.model.StockHome
        .replace('[marketName]', item.marketName)
        .replace('[stockCode]', item.code))
    }
  })
  return unlinks
}