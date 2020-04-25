const path = require(`path`)
const { quest, writeFile } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`

export async function recordKlines(response) {
  try {
    // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
    const homeUrl = response._request._frame._navigationURL || ''
    const stockCode = homeUrl.replace(/^http.*?[shsz](\d*?)\.(html?)$/ig, '$1')
    const file = path.join(recordPath, stockCode + '.json')
    console.log('kline:', stockCode)
    // 修改数据的请求数量
    const url = response.url().replace(/^(http.*?)\&lmt\=\d*?\&(.*?)$/, '$1&lmt=99999&$2')
    const dirtyData = await quest(url)
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    return writeFile(file, {
      date: new Date().getTime(),
      ...pureData.data
    })
  } catch (error) {
    return false
  }
}
