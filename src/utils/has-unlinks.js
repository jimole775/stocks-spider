const fs = require('fs')
/**
 * links 中，必须包含【股票代码】
 * recordDir 目录下的文件，必须确保能取到【股票代码】
 * @param {*} links  
 * @param {*} recordDir 
 */
module.exports = function hasUninks(links, recordDir) {
  if (links.length === 0) return links
  // 目录找不到，就直接返回所有links
  if (!fs.existsSync(recordDir)) return links

  const unlinks = []
  const files = fs.readdirSync(recordDir)
  if (files.length !== links.length) {
    let l = links.length
    while (l--) {
      const urlItem = links[l]
      let k = files.length
      let isAlready = false
      while (k--) {
        const stockCode = files[k].replace(/^.*\D?(\d{6})\D?.*$/, '$1')
        const reg = new RegExp(`\^${stockCode}\$|\^${stockCode}\\D*|\\D*${stockCode}\$|(\\D${stockCode}\\D)`, 'g')
        if (reg.test(urlItem)) {
          isAlready = true
          break
        }
      }
      if (!isAlready) {
        unlinks.push(urlItem)
      }
    }
  }
  return unlinks
}
