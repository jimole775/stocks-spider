import fs from 'fs'
import path from 'path'
const { readFile } = require(`./read-file`)
/**
 * links 中，必须包含【股票代码】
 * recordDir 目录下的文件，必须确保能取到【股票代码】
 * @param {*} links  
 * @param {*} recordDir 
 */
export function hasRefreshLinks(links, recordDir) {
  return new Promise(async (s, j) => {
    const files = fs.readdirSync(recordDir)
    if (files.length === 0) return s([])
    if (links.length === 0) return s([])
    if (!fs.existsSync(recordDir)) return s([])

    const expireFiles = []
    // 如果被访问的第一个文件有时间戳，
    // 那么，默认所有文件都有时间戳，
    // 并对全部文件都进行一次时间戳的验证
    for (const file of files) {
      const data = await readFile(path.join(recordDir, file))
      // 当前时间对比文件的时间戳，不超过一天，就不需要进行重新采集
      if (data && new Date().getTime() - data.date < 24 * 60 * 60 * 1000) {
        continue
      }
      expireFiles.push(file)
    }
    
    return s(matchURL(links, expireFiles))
  }).catch((err) => {
    return s(links)
  })
}

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
