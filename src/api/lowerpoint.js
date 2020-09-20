const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const lp_db_base = path.join(global.db_api, 'lowerpoint')
const code_name = require(path.join(global.db_dict, 'code-name.json'))
module.exports = function kline (req, res) {
  const resData = {
    list: [],
    total: 0
  }
  return new Promise((resolve) => {
    const { pageNumber, pageSize, date: queryDate, code: queryCode, dateRange: queryDateRange, name: stockName } = req.body
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dates = readDirSync(lp_db_base)
    let loop = 0
    dates.forEach((date) => {
      // 匹配 date 查询，如果 queryDate 有值，但是匹配不到对应的date，直接退出
      if (queryDate && queryDate !== date) return false
      const codeFiles = readDirSync(path.join(lp_db_base, date))
      codeFiles.forEach((codeFile) => {
        const code = codeFile.split('.').shift()
        // 匹配 code 查询，如果 queryCode 有值，但是匹配不到对应的code，直接退出
        if (queryCode && queryCode !== code) return false

        loop += 1
        // 匹配 分页 查询
        if (loop > start && loop < (start + pageSize + 1)) {
          const item = readFileSync(path.join(lp_db_base, date, codeFile))
          
          // 匹配 name 查询
          if (stockName && stockName !== code_name[code]) {
            loop -= 1
            return false
          }
          item.name = code_name[code]
          item.code = code
          item.date = date
          resData.list.push(item)
        }
      })
    })
    resData.total = loop
    return resolve(resData)
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
