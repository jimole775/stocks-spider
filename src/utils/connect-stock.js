const path = require('path')
const readDirSync = require('./read-dir-sync')
const readFileSync = require('./read-file-sync')
const diffrence = require('./diffrence')
const assert = require('./assert')
/**
 * 读取指定存储目录的stock
 * @param { Array } dict
 * @param { Array|String } ignoreDates
 * @param { Function } callback
 * @return { Undefined }
 */
module.exports = function connectStock(dict, ignoreDates, callback) {
  if (assert.isFunction(ignoreDates)) {
    callback = ignoreDates
    ignoreDates = null
  }

  if (assert.isString(ignoreDates)) {
    ignoreDates = [ignoreDates]
  }

  let dates = readDirSync(dict)
  if (ignoreDates) {
    dates = diffrence(dates, ignoreDates)
  }
  console.log('connectStock', dates)

  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i]
    const stocks = readDirSync(path.join(dict, date))
    for (let j = 0; j < stocks.length; j += 1) {
      const stock = stocks[j]
      const fileData = readFileSync(path.join(dict, date, stock))
      callback && callback(fileData, date, stock.split('.').shift())
    }
  }
}