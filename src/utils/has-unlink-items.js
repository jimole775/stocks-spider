import fs from 'fs'
/**
 * urls 和 recordDir 读出来的文件名 都需要包含股票代码
 * @param {*} urls  
 * @param {*} recordDir 
 */
export function hasUnlinkItems(urls, recordDir) {
  const unlinkItems = []
  const files = fs.readdirSync(recordDir)
  if (files.length !== urls.length) {
    let l = urls.length
    while (l--) {
      const urlItem = urls[l]
      let k = files.length
      let isAlready = false
      while (k--) {
        const fileItem = files[k].replace(/\D*(\d{6})\D*/,'$1')
        if (urlItem.includes(fileItem)) {
          isAlready = true
          break
        }
      }
      if (!isAlready) {
        unlinkItems.push(urlItem)
      }
    }
  }
  return unlinkItems
}