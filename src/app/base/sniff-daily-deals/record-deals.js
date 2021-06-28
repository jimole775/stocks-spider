/**
 * return:
 * [
 *  {
 *    t: 1234,
 *    p: 1234,
 *    v: 1234,
 *    bs: 1234, // 交易类型'1'：卖出，'2'：买入，'4'：竞价
 *  }
 * ]
 */
const path = require('path')
const { writeFileSync, quest, dealApiFactory } = require(global.utils)
const fileModel = `deals/${global.finalDealDate}.json`

module.exports = async function recordPeerDeal(recordItem) {
  return new Promise((resolve) => excutes(recordItem, resolve, 0))
}

// http://push2ex.eastmoney.com/getStockFenShi?pagesize=99999&ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wzfscj&cb=jQuery112308687412063259543_1592944461518&pageindex=0&id=6039991&sort=1&ft=1&code=603999&market=1&_=1592944461519
async function excutes (recordItem, resolve, loopTimes) {
  try {
    const id = recordItem.id + '' // 保持id为字符串
    const stockCode = id.substring(0, id.length - 1)
    const api = dealApiFactory(recordItem)
    const savePath = path.join(global.db_stocks, stockCode, fileModel)
    const dirtyData = await quest(api) || 'jquey_123456({"data":{"data":[]}});'
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    await writeFileSync(savePath, spillDetail(pureData.data || []))
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return resolve() // 超过30次都不能成功quest，就直接跳过
    console.error('record-deals error:', recordItem.id, error)
    return setTimeout(() => excutes(recordItem, resolve, ++loopTimes), 1000)
  }
}

// 拼装一些可简单计算的数据，以便调用，不用再通过浏览器爬取
function spillDetail (data) {
  let hp = 0 // 当日最高价
  let ep = 0 // 当日收盘价
  let dp = 9999999 // 当日最低价
  data.data && data.data.forEach((deal) => {
    if (deal.p > hp) hp = deal.p
    if (deal.p < dp) dp = deal.p
    ep = deal.p
  })
  data.hp = hp
  data.dp = dp
  data.ep = ep
  return data
}