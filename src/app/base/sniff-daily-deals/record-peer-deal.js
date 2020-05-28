import path from 'path'
const { writeFileAsync, quest } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/peer-deals/`
export async function recordPeerDeal(response) {
  try {
    // 修改数据的请求数量?pagesize=144&
    const url = response.url().replace(/^(http.*?)\?pagesize\=\d*?\&(.*?)$/, '$1?pagesize=99999&$2')
    const dirtyData = await quest(url)
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    const stockCode = pureData.data.c
    const stockName = pureData.data.n
    console.log('deal:', stockCode)
    return writeFileAsync(path.join(recordPath, global.finalDealDate, `${stockCode}.json`),
      {
        date: new Date(global.finalDealDate).getTime(), 
        data: pureData.data.data
      })
  } catch (error) {
    console.error('deal error:', error)
    return false
  }
}