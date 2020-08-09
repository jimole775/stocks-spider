const path = require('path')
const readDirSync = require('./read-dir-sync')
const readFileSync = require('./read-file-sync')
const diffrence = require('./diffrence')
const assert = require('./assert')
const dict_code_name = require(path.join(global.db_dict,'code-name.json'))
const dbPath = global.db_stocks
/**
 * 读取指定存储目录的stock
 * 当前仅支持目录结构 `${global.db_stocks}/${stock}/${targetDir}/${date}`
 * @param { Array } dict
 * @param { Array|String } ignoreObject
 * @param { Function } callback
 * @return { Undefined }
 */
module.exports = function connectStock(targetDir, ignoreObject, callback) {
  if (assert.isFunction(ignoreObject)) {
    callback = ignoreObject
    ignoreObject = null
  }

  // 不支持 字符串 形式
  if (assert.isString(ignoreObject)) {
    ignoreObject = null
  }

  let ignoreCodes = null
  let ignoreDates = null
  if (ignoreObject) {
    ignoreCodes = ignoreObject.ignoreCodes
    ignoreDates = ignoreObject.ignoreDates
  }

  let stockCodes = readDirSync(dbPath)
  if (!stockCodes || stockCodes.length === 0) {
    // 项目刚建立，还没有创建表
    throw new Error('stockCodes directory is not build!')
  }

  if (ignoreCodes) stockCodes = diffrence(stockCodes, ignoreCodes)

  for (let i = 0; i < stockCodes.length; i += 1) {
    const stockCode = stockCodes[i]
    if (global.blackName.test(dict_code_name[stockCode])) continue
    console.log(stockCode, dict_code_name[stockCode])
    let dateFiles = readDirSync(path.join(dbPath, stockCode, targetDir))
    if (ignoreDates) dateFiles = diffrence(dateFiles, ignoreDates)
    for (let j = 0; j < dateFiles.length; j++) {
      const dateFile = dateFiles[j]
      const fileData = readFileSync(path.join(dbPath, stockCode, targetDir, dateFile))
      callback && callback(fileData, stockCode, dateFile.split('.').shift())
    }
  }
}
