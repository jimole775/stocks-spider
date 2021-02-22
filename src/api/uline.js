const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const uline_db = path.join(global.db_api, 'uline')
const { transferStock } = require('./toolkit')
// const code_name = readFileSync(path.join(global.db_dict, 'code-name.json'))

module.exports = function uline (req, res) {
  const resData = {
    list: [],
    total: 0
  }
  return new Promise((resolve) => {
    const { pageNumber, pageSize, date: queryDate, stock, dateRange: queryDateRange } = req.body
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dates = readDirSync(uline_db)
    const finalDealDate = dates[dates.length - 1]
    const codeFiles = readDirSync(path.join(uline_db, finalDealDate))
    const queryCode = transferStock(stock)
    let loop = 0
    codeFiles.forEach((codeFile) => {
      const code = codeFile.split('.').shift()
      // 匹配 date 查询，如果 queryCode 有值，但是匹配不到对应的date，直接退出
      if (queryCode && code !== queryCode) return false
      
      const data = readFileSync(path.join(uline_db, finalDealDate, codeFile))

      if (queryDate && !queryByDate(data.klines, queryDate)) return false

      loop += 1
      // 匹配 分页 查询
      if (loop > start && loop < (start + pageSize + 1)) {
        resData.list.push(data)
      }
    })
    resData.total = loop
    return resolve(resData)
  })
}

function queryByDate (klines = [], queryDate) {
  let isExist = false
  for (let index = 0; index < klines.length; index++) {
    const element = klines[index]
    if (element.includes(queryDate)) {
      isExist = true
      break
    }
  }
  return isExist
}