const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const vline_db_base = path.join(global.db_api, 'vlines')
module.exports = function kline (req, res) {
  const resData = {
    code: 200,
    message: 'success',
    data: [],
    total: 0
  }
  try {
    const { pageNumber, pageSize, date: queryDate, code: queryCode, dateRange: queryDateRange, name: stockName } = req.body
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    const dates = readDirSync(vline_db_base)
    let loop = 0
    dates.forEach((date) => {
      // 匹配 date 查询，如果 queryDate 有值，但是匹配不到对应的date，直接退出
      if (queryDate && queryDate !== date) return false
      const codes = readDirSync(path.join(vline_db_base, date))
      codes.forEach((code) => {
        // 匹配 code 查询，如果 queryCode 有值，但是匹配不到对应的code，直接退出
        if (queryCode && (queryCode + '.json') !== code) return false

        loop += 1
        // 匹配 分页 查询
        if (loop > start && loop < (start + pageSize)) {
          const item = readFileSync(path.join(vline_db_base, date, code))
          
          // 匹配 name 查询
          if (stockName && stockName !== item.name) {
            loop -= 1
            return false
          }
          item.date = date
          item.vstart = timeFormat(item.timeRange.split('~')[0])
          item.vend = timeFormat(item.timeRange.split('~')[1])
          item.code = code.split('.').shift()
          resData.data.push(item)
        }
      })
    })
    resData.total = loop
    res.send(resData)
  } catch (error) {
    resData.code = 5001
    resData.message = error
    console.log(error)
    res.send(resData)
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
