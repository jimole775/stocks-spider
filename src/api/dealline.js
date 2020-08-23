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
    open_p: 0
  }
  const failModel = {
    code: 40000,
    message: 'failure',
    data: null,
    open_p: 0
  }
  try {
    let { stock, date } = req.body
    // stock 和 date 为必填
    if (!stock || !date) {
      failModel.message = '日期和股票代码是查询必填项！'
      return res.send(failModel)
    }
    date = moment(date).format('YYYY-MM-DD')

    // 如果是6位长度，确定就是股票代码
    // 否则就是股票名
    if (stock.length !== 6) {
      stock = name_code[stock]
    }
    const { data = null, cp: open_p } = readFileSync(path.join(global.db_stocks, stock, 'deals', date + '.json'))
    let loop = 0
    let bigDealIn = 0
    let bigDealOut = 0
    let tinyDealIn = 0
    let tinyDealOut= 0
    data && data.forEach((dealItem) => {
      // const sum = (dealItem.p / 1000) * dealItem.v * 100
      // 查询大单
      // if (gradient && sum < gradient * 10000) {
      //   if (dealItem.bs === 2) tinyDealIn += sum
      //   if (dealItem.bs === 1) tinyDealOut += sum
      //   return false
      // }

      // if (dealItem.bs === 2) bigDealIn += sum
      // if (dealItem.bs === 1) bigDealOut += sum

      // 查询类型
      // if (type && Number.parseInt(type) !== Number.parseInt(dealItem.bs)) return false

      // loop = loop + 1
      // 匹配 分页 查询
      // if (loop > start && loop < (start + pageSize + 1)) {
      dealItem.p = (dealItem.p / 1000).toFixed(2)
      dealItem.t = timeFormat(dealItem.t)
      successModel.data.push(dealItem)
      // }
    })
    // successModel.bigDealIn = bigDealIn
    // successModel.bigDealOut = bigDealOut
    // successModel.tinyDealIn = tinyDealIn
    // successModel.tinyDealOut = tinyDealOut
    successModel.open_p = (open_p / 1000).toFixed(2)
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
