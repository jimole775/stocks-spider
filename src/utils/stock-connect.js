const path = require('path')
const readDirSync = require('./read-dir-sync')
const readFileSync = require('./read-file-sync')
const diffrence = require('./diffrence')
const assert = require('./assert')
const { runInThisContext } = require('vm')
const BunchThread = require('./bunch-thread')
const dict_code_name = require(path.join(global.path.db.dict, 'code-name.json'))
const dbPath = global.path.db.stocks
const LogTag = 'utils.StockConnect => '
/**
 * 读取指定存储目录的stock
 * 当前仅支持目录结构 `${global.path.db.stocks}/${stock}/${targetDir}/${date}`
 * @param { Array } dict
 * @param { Array | String } ignoreObject
 * @return { Promise }
 */
function StockConnect(targetDir, ignoreObject) {
  // this.eventsParams = []
  this.bunch = new BunchThread(1)
  this.dataEventReceiver = null
  this.endEventReceiver = null
  this.targetDir = targetDir

  // 不支持 字符串 形式
  if (assert.isString(ignoreObject)) {
    ignoreObject = null
  }

  this.ignoreCodes = null
  this.ignoreDates = null
  if (ignoreObject) {
    this.ignoreCodes = ignoreObject.codes
    this.ignoreDates = ignoreObject.dates
  }

  this.stockCodes = readDirSync(dbPath)
  if (!this.stockCodes || this.stockCodes.length === 0) {
    // 项目刚建立，还没有创建表
    throw new Error(LogTag + 'stockCodes directory is not build!')
  }

  if (this.ignoreCodes) this.stockCodes = diffrence(this.stockCodes, this.ignoreCodes)

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

StockConnect.prototype.emit = async function () {
  for (let i = 0; i < this.stockCodes.length; i++) {
    const code = this.stockCodes[i]

    // 匹配黑名单
    if (global.blackName.test(dict_code_name[code])) continue

    console.log(LogTag, code, dict_code_name[code])

    let dateFiles = readDirSync(path.join(dbPath, code, this.targetDir))

    if (this.ignoreDates) dateFiles = cuteIgnoreDates(dateFiles, this.ignoreDates)

    for (let j = 0; j < dateFiles.length; j++) {
      const dateFile = dateFiles[j]
      const fileData = readFileSync(path.join(dbPath, code, this.targetDir, dateFile))
      const params = [fileData, code, dateFile.split('.').shift()]
      await this.dataEventReceiver.apply(this, params)
    }
  }
  this.bunch.finally(() => {
    this.endEventReceiver && this.endEventReceiver()
  })
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
