const dbPath = global.db
const path = require('path')
const allStocks = require(global.baseData).data
const readDirSync = require('./read-dir-sync')
module.exports = function unrecordFiles (targetDir) {
  const result = {
    // [stockCode]: [unRecoedDateFiles]
  }

  allStocks.forEach(({ code }) => {
    const dateFiles = readDirSync(path.join(dbPath, code, targetDir))
    result[code] = dateFiles
  })

  return result
}