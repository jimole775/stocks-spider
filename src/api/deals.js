const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const { queryStockCode } = require('./toolkit')
const moment = require('moment')
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
    let { pageNumber, pageSize, gradient, type, stock, date: queryDate, dateRange: queryDateRange } = req.body
    // stock 和 queryDate 为必填
    if (!stock || !queryDate) {
      return resolve('日期和股票代码是查询必填项！')
    }
    const stockCode = queryStockCode(stock)
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dealRecord = readFileSync(path.join(global.db_stocks, stockCode, 'deals', queryDate + '.json'))
    let loop = 0
    let bigDealIn = 0
    let bigDealOut = 0
    let tinyDealIn = 0
    let tinyDealOut = 0
    dealRecord.data.forEach((dealItem) => {
      const sum = (dealItem.p / 1000) * dealItem.v * 100
      // 查询大单
      if (gradient && sum < gradient * 10000) {
        if (dealItem.bs === 2) tinyDealIn += sum
        if (dealItem.bs === 1) tinyDealOut += sum
        return false
      }

      if (dealItem.bs === 2) bigDealIn += sum
      if (dealItem.bs === 1) bigDealOut += sum

      // 查询类型
      if (type && Number.parseInt(type) !== Number.parseInt(dealItem.bs)) return false

      loop = loop + 1
      // 匹配 分页 查询
      if (loop > start && loop < (start + pageSize + 1)) {
        dealItem.p = (dealItem.p / 1000).toFixed(2)
        dealItem.t = timeFormat(dealItem.t)
        model.list.push(dealItem)
      }
    })
    model.bigDealIn = bigDealIn
    model.bigDealOut = bigDealOut
    model.tinyDealIn = tinyDealIn
    model.tinyDealOut = tinyDealOut
    model.total = loop
    return resolve(model)
  })
}

function timeFormat (t) {
  if (t === null && t === undefined) {
    t = ''
  }
  t = (t + '').trim()
  let s = t.substring(t.length - 2, t.length)
  let m = t.substring(t.length - 4, t.length - 2)
  let h = t.substring(t.length - 6, t.length - 4)
  h = h.length === 1 ? '0' + h : h
  return `${h}:${m}:${s}`
}
