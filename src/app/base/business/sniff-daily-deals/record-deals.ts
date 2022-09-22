import { ApiStore, TextDealModelFromJson } from '@/types/stock';
import { QuestResponse } from '@/utils';

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
const querystring = require('querystring')

export type DealResponseData = {
  t: number, p: number, v: number, bs: number
}

export default async function recordDeals(recordItem: ApiStore): Promise<void> {
  return new Promise((resolve) => excutes(recordItem, resolve, 0))
}

// http://push2ex.eastmoney.com/getStockFenShi?pagesize=99999&ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wzfscj&cb=jQuery112308687412063259543_1592944461518&pageindex=0&id=6039991&sort=1&ft=1&code=603999&market=1&_=1592944461519
async function excutes (recordItem: ApiStore, resolve: Function, loopTimes: number): Promise<any> {
  const { writeFileSync, quest } = global.$utils
  const fileModel = `deals/${global.$finalDealDate}.json`
  const id = (recordItem.id || recordItem.secid) + '' // 保持id为字符串
  const stockCode = id.substring(0, id.length - 1)
  const api = dealApiFactory(recordItem)
  const savePath = path.join(global.$path.db.stocks, stockCode, fileModel)
  try {
    const res: QuestResponse = await quest(api) || 'jquey_123456({"data":{"data":[]}});'
    if (res.code === 200) {
      const data = res.data.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1')
      const dataConstrutor = JSON.parse(data)
      const coreData = createFields(dataConstrutor.data || {})
      await writeFileSync(savePath, coreData || {})
      console.log('交易详情-存入股票：', stockCode)
      resolve()
    } else {
      resolve()
    }
  } catch (error) {
    if (loopTimes < 5) {
      console.error(stockCode, '交易详情-报错:', error)
      return setTimeout(() => excutes(recordItem, resolve, ++loopTimes), 1000)
    } else {
      // 超过10次都不能成功quest，就直接跳过
      loopTimes = 0
      await writeFileSync(savePath, {})
      console.log(stockCode, '无法获取，直接存入空数据！')
      resolve()
    }
  }
}

// 拼装一些可简单计算的数据，以便调用，不用再通过浏览器爬取
function createFields (data: TextDealModelFromJson) {
  let hp = 0 // 当日最高价
  let ep = 0 // 当日收盘价
  let dp = 9999999 // 当日最低价
  const iterationData: DealResponseData [] = data.data || []
  iterationData.forEach((deal) => {
    if (deal.p > hp) hp = deal.p
    if (deal.p < dp) dp = deal.p
    ep = deal.p
  })
  data.dt = 0 // deals的数据结构分 0 1 两种
  data.hp = hp
  data.dp = dp
  data.ep = ep
  return data
}

/**
 * deal的api的拼装函数
 * @param {Object|Map} param get类型的参数，这些参数都是预存在base.json里的
 * @return {String}
 */
function dealApiFactory ({ ut, cb, id }: ApiStore): string {
  // id: 股票代码 + 股票市场 6000011
  // cb: jsonp的回调名
  // ut: 用户token
  // _: 时间戳
  id = id + ''
  const id_market_dict: {[key: string]: number} = { '2': 0, '1': 1 }
  const market = id_market_dict[id.substring(id.length - 1)]
  const code = id.substring(0, id.length - 1)
  const _ = new Date().getTime()
  const defaultQuery = {
    pageindex: 0,
    pagesize: 99999,
    dpt: 'wzfscj',
    sort: 1, // 正序
    ft: 1,
    ut, cb, id, _, market, code
  }
  const host = 'push2ex.eastmoney.com/getStockFenShi'
  return `http://${host}?${querystring.encode(defaultQuery)}`
}
