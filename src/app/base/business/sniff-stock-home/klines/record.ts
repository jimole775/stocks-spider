import { ApiStore } from '@/types/stock';
/**
 * "2021-12-02, 17.62, 17.59, 17.81, 17.37, 994798, 1749164560.00, 2.49",
 * "日期，开盘价，收盘价，最高价，最低价，量，价，振幅"
 */
const path = require(`path`)
const uri = require(`./uri`)
const { quest, writeFileSync } = global.$utils

// 前复权 K线，主要用于计算模型用，因为复权会导致股价巨幅下降，导致数据误差
const dataPath = `klines/daily/${global.$finalDealDate}.json`
const dataPath_week = `klines/week/${global.$finalDealDate}.json`
const dataPath_month = `klines/month/${global.$finalDealDate}.json`
const fr_dataPath = `/fr-klines/daily/${global.$finalDealDate}.json`
const fr_dataPath_week = `/fr-klines/week/${global.$finalDealDate}.json`
const fr_dataPath_month = `/fr-klines/month/${global.$finalDealDate}.json`

export default async function recordKlines ({ secid, cb, ut }: ApiStore): Promise<void> {
  return new Promise((resolve, reject) => executes({ secid, cb, ut }, resolve, reject, 0))
}

/**
 * 递归函数
 * @param {Object} recordItem 分解api得来的对象
 * @param {Function} resolve Promise的参数
 * @param {Function} reject Promise的参数
 * @param {Number} loopTimes 递归次数
 * @returns Promise.resolve
 */
async function executes (recordItem: ApiStore, resolve: Function, reject: Function, loopTimes: number): Promise<any> {
  try {
    await pickKline(recordItem)
    await pickFRKline(recordItem)
    return resolve()
  } catch (error) {
    if (loopTimes > 30) return reject() // 超过30次都不能成功quest，就直接跳过
    console.error('record-klines error:', error)
    return setTimeout(() => executes(recordItem, resolve, reject, ++loopTimes), 1000)
  }
}

// http://89.push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery112403637119003265299_1593112370285&secid=1.603999&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58&klt=101&fqt=0&end=20500101&lmt=120&_=1593112370347
async function pickKline (recordItem: ApiStore): Promise<void> {
  const { stock, klineApi_daily, klineApi_week, klineApi_month } = uri.spill({ fqt: 0, ...recordItem })
  const file = path.join(global.$path.db.stocks, stock, dataPath)
  // const file_week = path.join(global.$path.db.stocks, stock, dataPath_week)
  // const file_month = path.join(global.$path.db.stocks, stock, dataPath_month)
  await handleRecord(file, klineApi_daily)
  // await handleRecord(file_week, klineApi_week)
  // await handleRecord(file_month, klineApi_month)
  return Promise.resolve()
}

async function pickFRKline (recordItem: ApiStore): Promise<void> {
  const { stock, klineApi_daily, klineApi_week, klineApi_month } = uri.spill({ fqt: 1, ...recordItem })
  const file = path.join(global.$path.db.stocks, stock, fr_dataPath)
  // const file_week = path.join(global.$path.db.stocks, stock, fr_dataPath_week)
  // const file_month = path.join(global.$path.db.stocks, stock, fr_dataPath_month)
  await handleRecord(file, klineApi_daily)
  // await handleRecord(file_week, klineApi_week)
  // await handleRecord(file_month, klineApi_month)
  return Promise.resolve()
}

async function handleRecord (file: string, api: string): Promise<void> {
  // 修改数据的请求数量
  const dirtyData = await quest(api) // 'jquey_123456({"data":{"klines":[]}});'
  const pureData = JSON.parse(dirtyData.data.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  writeFileSync(file, pureData.data ? pureData.data : {})
  return Promise.resolve()
}
