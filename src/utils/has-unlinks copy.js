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
module.exports = function hasUnlinks(recordDir) {
  const links = allStocks.map(item => {
    return urlModel.model.StockHome
      .replace('[marketName]', item.marketName)
      .replace('[stockCode]', item.code)
  })

  if (links.length === 0) return []
  // 目录找不到，就直接返回所有links
  if (!fs.existsSync(recordDir)) return links

  const unlinks = []
  const files = fs.readdirSync(recordDir)
  if (files.length !== links.length) {
    let l = links.length
    while (l--) {
      const linkItem = links[l]
      let k = files.length
      let isAlready = false
      while (k--) {
        const stockCode = files[k].replace(/^.*\D?(\d{6})\D?.*$/, '$1')
        const reg = new RegExp(`\^${stockCode}\$|\^${stockCode}\\D*|\\D*${stockCode}\$|(\\D${stockCode}\\D)`, 'g')
        if (reg.test(linkItem)) {
          files.splice(k, 1)
          isAlready = true
          break
        }
      }
      if (isAlready === false) unlinks.push(linkItem)
    }
  }
  return unlinks
}
