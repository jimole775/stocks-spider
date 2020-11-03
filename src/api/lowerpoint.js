const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const lp_db_base = path.join(global.db_api, 'lowerpoint')
const { transferStock } = require('./toolkit')
const code_name = require(path.join(global.db_dict, 'code-name.json'))
module.exports = function kline (req, res) {
  const resData = {
    list: [],
    total: 0
  }
  return new Promise((resolve) => {
    const { pageNumber, pageSize, date: queryDate, stock, dateRange: queryDateRange } = req.body
    if (!queryDate) {
      return resolve('date是查询必填项！')
    }
    const start = (Number.parseInt(pageNumber) - 1) * Number.parseInt(pageSize)
    // readDirSync(path.join(lp_db_base, queryDate))
    // const dates = readDirSync(lp_db_base)
    const queryCode = transferStock(stock)
    let loop = 0
    const codeFiles = readDirSync(path.join(lp_db_base, queryDate))
    codeFiles && codeFiles.forEach((codeFile) => {
      const code = codeFile.split('.').shift()
      // 匹配 code 查询，如果 stock 有值，但是匹配不到对应的code，直接退出
      if (queryCode && queryCode !== code) return false

      loop += 1
      // 匹配 分页 查询
      if (loop > start && loop < (start + pageSize + 1)) {
        const item = readFileSync(path.join(lp_db_base, queryDate, codeFile))
        item.name = code_name[code]
        item.code = code
        item.date = queryDate
        resData.list.push(item)
      }
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

// 市值选项：10亿，100亿，200亿，300亿，400亿，500亿，600亿，...10000亿
// 股价选项：10元内，10-30元，30-40，40-50，

