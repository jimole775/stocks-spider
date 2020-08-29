const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const code_name = require(`${global.db_dict}/code-name.json`)
const name_code = require(`${global.db_dict}/name-code.json`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const moment = require('moment')
module.exports = function deals (req, res) {
  const successModel = {
    code: 20000,
    message: 'success',
    data: [],
    total: 0,
    bigDealIn: 0,
    bigDealOut: 0,
    tinyDealIn: 0,
    tinyDealOut: 0
  }
  const failModel = {
    code: 40000,
    message: 'failure',
    data: null,
    total: 0,
    bigDealIn: 0,
    bigDealOut: 0,
    tinyDealIn: 0,
    tinyDealOut: 0
  }
  try {
    let { stock, dateRange: queryDateRange } = req.body
    // stock 和 queryDate 为必填
    if (!stock) {
      failModel.message = '股票代码是查询必填项！'
      return res.send(failModel)
    }

    // 如果是6位长度，确定就是股票代码
    // 否则就是股票名
    if (stock.length !== 6) {
      stock = name_code[stock]
    }
    const basePath = path.join(global.db_stocks, stock, 'klines', 'daily')
    const lastDate = readDirSync(basePath).pop()
    const klineRecord = readFileSync(path.join(basePath, lastDate))
    successModel.data = klineRecord.klines
    res.send(successModel)
  } catch (error) {
    failModel.code = 50000
    failModel.message = error
    console.log(error)
    res.send(failModel)
  }
}
