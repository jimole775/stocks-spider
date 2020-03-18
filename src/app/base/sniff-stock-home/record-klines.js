const path = require(`path`)
const { quest, readFile, writeFile } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/daily-klines/`

export async function recordKlines(response) {
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  const homeUrl = response._request._frame._navigationURL || ''
  const stockCode = homeUrl.replace(/^http.*?[shsz](\d*?)\.(html?)$/ig, '$1')
  console.log('kline:', stockCode)
  const file = path.join(recordPath, stockCode + '.json')
  const alreadyData = await readFile(file)
  if (alreadyData && alreadyData.date - new Date().getTime() < 24 * 60 * 60 * 1000) {
    return alreadyData.data
  }
  // 修改数据的请求数量
  const url = response.url().replace(/^(http.*?)\&lmt\=\d*?\&(.*?)$/, '$1&lmt=99999&$2')
  const dirtyData = await quest(url)
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  return writeFile(file, {
    date: new Date().getTime(),
    ...pureData.data
  })
}
