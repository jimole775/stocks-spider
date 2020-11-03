const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
// const code_name = require(`${global.db_dict}/code-name.json`)
// const name_code = require(`${global.db_dict}/name-code.json`)
const { transferStock } = require('./toolkit')
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
module.exports = function deals (req, res) {
  const model = {
    list: [],
    total: 0,
    bigDealIn: 0,
    bigDealOut: 0,
    tinyDealIn: 0,
    tinyDealOut: 0
  }
  return new Promise((resolve) => {
    let { stock, dateRange: queryDateRange } = req.body
    // stock 和 queryDate 为必填
    if (!stock) {
      return resolve('股票代码是查询必填项！')
    }
    const stockCode = transferStock(stock)
    const basePath = path.join(global.db_stocks, stockCode, 'klines', 'daily')
    const lastDate = readDirSync(basePath).pop()
    const klineRecord = readFileSync(path.join(basePath, lastDate))
    model.list = klineRecord.klines
    return resolve(model)
  })
}
