const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const { queryStockCode } = require('./toolkit')
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const moment = require('moment')
module.exports = function deals (req, res) {
  return new Promise((resolve) => {
    let { stock, date } = req.body
    if (!stock || !date) return resolve('日期和股票代码是查询必填项！')
    const stockCode = queryStockCode(stock)
    const list = []
    const { data = [], cp: open_p } = readFileSync(filePath(stockCode, date))
    
    splitByMinute(data).forEach((dealItem) => {
      dealItem.p = (dealItem.p / 1000).toFixed(2)
      dealItem.t = timeFormat(dealItem.t)
      list.push(dealItem)
    })
    return resolve({ list, open_p: (open_p / 1000).toFixed(2) })
  })
}

function timeFormat (t) {
  if (t === null && t === undefined) {
    t = ''
  }
  t = (t + '').trim()
  let m = t.substring(t.length - 4, t.length - 2)
  let h = t.substring(t.length - 6, t.length - 4)
  h = h.length === 1 ? '0' + h : h
  return `${h}:${m}`
}

function splitByMinute (deals = []) {
  // 切割成以分钟为单位
  const minuteMap = {}
  deals.forEach((dealItem) => {
    const t = (dealItem.t + '').replace(/^(.+)(\d\d)$/, '$1')
    minuteMap[t] = dealItem
  })
  return Object.values(minuteMap)
}

function filePath (stock, date) {
  return path.join(global.db_stocks, stock, 'deals', date + '.json')
}
