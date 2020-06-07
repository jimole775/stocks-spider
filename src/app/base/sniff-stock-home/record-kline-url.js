const { writeFileAsync } = require(`${global.srcRoot}/utils`)
module.exports = function recordKlineUrl (stockCode, url, FRUrl) {
  if (!global.baseData) return false
  const data = global.baseData.data
  data.forEach(dataItem => {
    if (dataItem.code === stockCode) {
      dataItem.kline = url
      dataItem.FRkline = FRUrl
    }
  })
  writeFileAsync(`${global.srcRoot}\\db\\warehouse\\base.json}`, data)
}