const path = require(`path`)
const { quest, writeFileAsync } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`
// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const formerRecordPath = `${global.srcRoot}/db/warehouse/former-daily-klines/`

export function recordKlines(response) {
  try {
    // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
    const homeUrl = response._request._frame._navigationURL || ''
    const stockCode = homeUrl.replace(/^http.*?[shsz](\d*?)\.(html?)$/ig, '$1')
    const file = path.join(recordPath, global.finalDealDate, stockCode + '.json')
    const FRFile = path.join(formerRecordPath, global.finalDealDate, stockCode + '.json')
    const url = response.url().replace(/^(http.*?)\&lmt\=\d*?\&(.*?)$/, '$1&lmt=99999&$2')
    const FRUrl = url.replace(/^(http.*?)\&fqt\=0\&(.*?)$/, '$1&fqt=1&$2')
    console.log('kline:', stockCode)
    // handleRecord(file, url)
    handleRecord(FRFile, FRUrl)
  } catch (error) {
    console.error('kline error:', error)
    return false
  }
}

async function handleRecord (file, url) {
    // 修改数据的请求数量
    const dirtyData = await quest(url)
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    return writeFileAsync(file, {
      date: new Date().getTime(),
      ...pureData.data
    })
}

