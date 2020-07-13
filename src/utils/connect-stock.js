const path = require('path')
const readDirSync = require('./read-dir-sync')
const readFileSync = require('./read-file-sync')
const diffrence = require('./diffrence')
const assert = require('./assert')
const dbPath = global.db
/**
 * 读取指定存储目录的stock
 * @param { Array } dict
 * @param { Array|String } ignoreDateFiles
 * @param { Function } callback
 * @return { Undefined }
 */
module.exports = function connectStock(targetDir, ignoreDateFiles, callback) {
  if (assert.isFunction(ignoreDateFiles)) {
    callback = ignoreDateFiles
    ignoreDateFiles = null
  }

  // 不支持 字符串 形式
  if (assert.isString(ignoreDateFiles)) {
    ignoreDateFiles = null
  }

  const stockCodes = readDirSync(dbPath)
  if (!stockCodes || stockCodes.length === 0) {
    // 项目刚建立，还没有创建表
    throw new Error('stockCodes directory is not build!')
  }

  for (let i = 0; i < stockCodes.length; i += 1) {
    const stockCode = stockCodes[i]
    let dateFiles = readDirSync(path.join(dbPath, stockCode, targetDir))
    if (ignoreDateFiles && ignoreDateFiles[stockCode].length) {
      dateFiles = diffrence(dateFiles, ignoreDateFiles[stockCode])
    }
    console.log(stockCode)
    for (let j = 0; j < dateFiles.length; j++) {
      const dateFile = dateFiles[j]
      const fileData = readFileSync(path.join(dbPath, stockCode, targetDir, dateFile))
      callback && callback(fileData, stockCode, dateFile.split('.').shift())
    }
  }
}