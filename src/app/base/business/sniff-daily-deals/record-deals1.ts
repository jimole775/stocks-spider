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
import path from 'path'
import querystring from 'querystring'
import { ApiStore } from '../../../../types/stock'
const { writeFileSync, quest } = global.$utils
const fileModel = `deals/${global.$finalDealDate}.json`

export default async function recordDeals(dealApi: ApiStore) {
  return new Promise((resolve) => excutes(dealApi, resolve, 0))
}

// "http://27.push2.eastmoney.com/api/qt/stock/details/sse?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55&mpi=2000&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&pos=-0&secid=1.603261&wbp2u=|0|0|0|web"
async function excutes (dealApi: ApiStore, resolve: Function, loopTimes: number): Promise<any> {
  const api: string = dealApiFactory(dealApi)
  const code: string = (dealApi.secid || '').split('.').pop() || ''
  const savePath: string = path.join(global.$path.db.stocks, code, fileModel)
  try {
    console.log('正在探测：', code)
    // 'data: {"rc":0,"rt":12,"svr":182995883,"lt":1,"full":1,"dlmkts":"","data":{"code":"000667","market":0,"decimal":2,"prePrice":1.6,"details":[]}'
    const res = await quest(api, {
      header: { 'Content-Type': 'text\/event-stream' },
      eventTerminal (text: string) {
        // data: {"rc":0,"rt":2,"svr":182995883,"lt":1,"full":1,"dlmkts":"","data":null}\n\n
        return (/"data":\s?null/.test(text))
      }
    })
    if (res.code === 200) {
      const data: string = res.data.replace(/^data:\s?(\{.+?\})/ig, '$1')
      const dataConstrutor = JSON.parse(data) || {}
      await writeFileSync(savePath, dataConstrutor.data || {})
      console.log('交易详情-存入股票：', code)
      resolve()
    } else {
      resolve()
    }
  } catch (error) {
    if (loopTimes < 5) {
      console.error(code, '交易详情-报错:', error)
      return setTimeout(() => excutes(dealApi, resolve, ++loopTimes), 1000)
    } else {
      // 超过10次都不能成功quest，就直接跳过
      loopTimes = 0
      await writeFileSync(savePath, {})
      console.log(code, '无法获取，直接存入空数据！')
      resolve()
    }
  }
}

// todo 2022/08/01 的数据，没有运行次方法
// 拼装一些可简单计算的数据，以便调用，不用再通过浏览器爬取
// function createFields (data) {
//   let hp = 0 // 当日最高价
//   let ep = 0 // 当日收盘价
//   let dp = 9999999 // 当日最低价
//   data.data && data.data.forEach((deal) => {
//     if (deal.p > hp) hp = deal.p
//     if (deal.p < dp) dp = deal.p
//     ep = deal.p
//   })
//   data.dt = 1 // deals的数据结构分 0 1 两种
//   data.hp = hp
//   data.dp = dp
//   data.ep = ep
//   return data
// }

/**
 * deal的api的拼装函数
 * @param {Object|Map} param get类型的参数，这些参数都是预存在base.json里的
 * @return {String}
 */
function dealApiFactory (dealApi: ApiStore): string {
  // fields1=f1,f2,f3,f4&
  // fields2=f51,f52,f53,f54,f55&
  // mpi=2000&
  // fltt=2&
  // pos=-0&
  // wbp2u=|0|0|0|web
  // ut=bd1d9ddb04089700cf9c27f6f7426281
  // secid=1.603261&
  const defaultQuery = {
    fields1: 'f1,f2,f3,f4',
    fields2: 'f51,f52,f53,f54,f55',
    mpi: 2000,
    fltt: 2,
    pos: '-0',
    wbp2u: '|0|0|0|web',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    secid: dealApi.secid
  }
  const host = '27.push2.eastmoney.com/api/qt/stock/details/sse'
  return `http://${host}?${querystring.encode(defaultQuery)}`
}
