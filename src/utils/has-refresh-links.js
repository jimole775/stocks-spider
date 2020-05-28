import fs from 'fs'
/**
 * links 中，必须包含【股票代码】
 * recordDir 目录下的文件，必须确保能取到【股票代码】
 * @param {*} links  
 * @param {*} recordDir 
 */
export function hasRefreshLinks(links, recordDir) {
  const files = fs.readdirSync(recordDir)
  if (files.length === 0) return []
  if (links.length === 0) return []
  // 如果还没生成文件夹，就直接返回 []
  if (!fs.existsSync(recordDir)) return []

  const expireFiles = []
  for (const file of files) {
    const recordedDate = file.split('.').shift()
    // 已保存文件的日期，超过最后交易日1天，就需要重新采集
    if (new Date(recordedDate).getTime() + 24 * 60 * 60 * 1000 
        < new Date(global.finalDealDate).getTime()) {
      expireFiles.push(file)
    }
  }

  return matchURL(links, expireFiles)
}

// 把文件名换成link
function matchURL(links, expireFiles) {
  const refreshLinks = []
  let l = links.length
  while (l--) {
    const linkItem = links[l]
    let k = expireFiles.length
    while (k--) {
      const stockCode = expireFiles[k].replace(/\D*(\d{6})\D*/, '$1')
      const reg = new RegExp(`\^${stockCode}\$|\^${stockCode}\\D*|\\D*${stockCode}\$|(\\D${stockCode}\\D)`, 'g')
      if (reg.test(linkItem)) {
        refreshLinks.push(linkItem)
        break
      }
    }
  }
  return refreshLinks
}
