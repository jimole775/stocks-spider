const path = require('path')
const readDirSync = require('./read-dir-sync')
const readFileSync = require('./read-file-sync')
const diffrence = require('./diffrence')
const assert = require('./assert')
const dict_code_name = require(path.join(global.path.db.dict,'code-name.json'))
const dbPath = global.path.db.stocks
const LogTag = 'utils.StockConnect => '
/**
 * 读取指定存储目录的stock
 * 当前仅支持目录结构 `${global.path.db.stocks}/${stock}/${targetDir}/${date}`
 * @param { Array } dict
 * @param { Array | String } ignoreObject
 * @param { Function } callback
 * @return { Promise }
 */
function StockConnect(targetDir, ignoreObject, callback) {
  this.eventsParams = []
  this.dataEventReceiver = null
  this.endEventReceiver = null
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
    ignoreCodes = ignoreObject.codes
    ignoreDates = ignoreObject.dates
  }

  let stockCodes = readDirSync(dbPath)
  if (!stockCodes || stockCodes.length === 0) {
    // 项目刚建立，还没有创建表
    throw new Error(LogTag + 'stockCodes directory is not build!')
  }

  if (ignoreCodes) stockCodes = diffrence(stockCodes, ignoreCodes)

  for (let i = 0; i < stockCodes.length; i += 1) {
    const stockCode = stockCodes[i]
    if (global.blackName.test(dict_code_name[stockCode])) continue
    console.log(LogTag, stockCode, dict_code_name[stockCode])
    let dateFiles = readDirSync(path.join(dbPath, stockCode, targetDir))
    if (ignoreDates) dateFiles = cuteIgnoreDates(dateFiles, ignoreDates)
    for (let j = 0; j < dateFiles.length; j++) {
      const dateFile = dateFiles[j]
      const fileData = readFileSync(path.join(dbPath, stockCode, targetDir, dateFile))
      if (callback) {
        callback(fileData, stockCode, dateFile.split('.').shift())
      } else {
        this.eventsParams.push([fileData, stockCode, dateFile.split('.').shift()])
      }
    }
  }

  return Promise.resolve()
}

StockConnect.prototype.on = function (option, callback) {
  if (utils.isObject(option)) {
    this.dataEventReceiver = option['data']
    this.endEventReceiver = option['end']
  }
  if (utils.isString(option) && callback) {
    if (option === 'data') {
      this.dataEventReceiver = callback
    }
    if (option === 'end') {
      this.endEventReceiver = callback
    }
  }
  return this
}

StockConnect.prototype.emit = function () {
  if (this.eventsParams.length && this.dataEventReceiver) {
    this.eventsParams.forEach((params) => {
      this.dataEventReceiver.apply(this, params)
    })
    this.eventsParams.length = 0
    this.endEventReceiver && this.endEventReceiver()
  }
  return this
}

function cuteIgnoreDates (dateFiles, ignoreDates) {
  const res = []
  const copyDates = ignoreDates.concat([])
  dateFiles.forEach((dateFile) => {
    res.push(dateFile)
    for (let index = 0; index < copyDates.length; index++) {
      const ignoreDate = copyDates[index]
      if (dateFile.includes(ignoreDate)) {
        res.pop()
        copyDates.splice(index, 1)
        break
      }
    }
  })
  return res
}

module.exports = StockConnect