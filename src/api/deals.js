const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
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
  }
  const failModel = {
    code: 40000,
    message: 'failure',
    data: null,
    total: 0,
    bigDealIn: 0,
    bigDealOut: 0,
  }
  try {
    const { pageNumber, pageSize, gradient, type, date: queryDate, code: queryCode, name: queryName, dateRange: queryDateRange } = req.body
    // queryCode 和 queryDate 为必填
    console.log(queryCode, queryDate)
    if (!queryCode || !queryDate) {
      failModel.message = '日期和股票代码是查询必填项！'
      return res.send(failModel)
    }
    const date = moment(queryDate).format('YYYY-MM-DD')
    console.log(path.join(global.db_stocks, queryCode, 'peer-deals', date + '.json'))
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dealRecord = readFileSync(path.join(global.db_stocks, queryCode, 'peer-deals', date + '.json'))
    let loop = 0
    let bigDealIn = 0 // 超过5万
    let bigDealOut = 0 // 超过5万
    const consult = 50000 
    dealRecord.data.forEach((dealItem) => {
      const sum = (dealItem.p / 1000) * dealItem.v * 100
      if (sum >= consult) {
        if (dealItem.bs === 2) bigDealIn += sum
        if (dealItem.bs === 1) bigDealOut += sum
      } 
      // 查询大单
      if (gradient && sum < gradient) return false

      // 查询类型
      if (type && Number.parseInt(type) !== Number.parseInt(dealItem.bs)) return false


      loop = loop + 1
      // 匹配 分页 查询
      if (loop > start && loop < (start + pageSize + 1)) {
        dealItem.p = (dealItem.p / 1000).toFixed(2)
        dealItem.t = timeFormat(dealItem.t)
        successModel.data.push(dealItem)
      }
    })
    successModel.bigDealIn = bigDealIn
    successModel.bigDealOut = bigDealOut
    successModel.total = loop
    res.send(successModel)
  } catch (error) {
    failModel.code = 50000
    failModel.message = error
    console.log(error)
    res.send(failModel)
  }
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
