const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const uline_db = path.join(global.db_api, 'uline')
const code_name = readFileSync(path.join(global.db_dict, 'code-name.json'))
module.exports = function uline (req, res) {
  const resData = {
    code: 20000,
    message: 'success',
    data: [],
    total: 0
  }
  try {
    const { pageNumber, pageSize, date: queryDate, code: queryCode, name: stockName, dateRange: queryDateRange } = req.body
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dates = readDirSync(uline_db)
    const finalDealDate = dates[dates.length - 1]
    const stocks = readDirSync(path.join(uline_db, finalDealDate))
    let loop = 0
    stocks.forEach((stock) => {
      const stockCode = stock.split('.').shift()
      // 匹配 date 查询，如果 queryCode 有值，但是匹配不到对应的date，直接退出
      if (queryCode && stockCode !== queryCode) return false

      if (stockName && !code_name[stockCode].includes(stockName)) return false
      
      const data = readFileSync(path.join(uline_db, finalDealDate, stock))

      if (queryDate && !queryByDate(data.klines, queryDate)) return false

      loop += 1
      // 匹配 分页 查询
      if (loop > start && loop < (start + pageSize + 1)) {
        resData.data.push(data)
      }
    })
    resData.total = loop
    res.send(resData)
  } catch (error) {
    resData.code = 50000
    resData.message = error
    console.log(error)
    res.send(resData)
  }
}

function queryByDate (klines = [], queryDate) {
  let isExist = false
  for (let index = 0; index < klines.length; index++) {
    const element = klines[index]
    if (element.includes(queryDate)) {
      isExist = true
    }
  }
  return isExist
}