import { StringObject } from "@/types/common"
const allStocks = require(global.$path.db.base_data).data
const BunchThread = require('./bunch-thread')
const LogTag = 'utils.requestApiInBunch => '
/**
 * 并发请求，api类型，直接访问api接口
 * @param { String } apikey
 * @param { Array } apis
 * @param { Function } task
 * @return { Promise[Array<String>] }
 */
 export default function requestApiInBunch (apikey: string, apis: string[], task: Function): Promise<string[]> {
  return new Promise((resolve) => {
    const unLinkStocks: object[] = []
    allStocks.forEach((stockItem: StringObject) => {
      for (let i = 0; i < apis.length; i++) {
        const urlItem = apis[i]
        if (urlItem.includes(stockItem.code) && stockItem[apikey]) {
          unLinkStocks.push(stockItem)
          apis.splice(i, 1)
          break
        }
      }
    })

    // 如果没有一个api被记录的，就直接返回 apis
    if (unLinkStocks.length === 0) return resolve(apis)

    const bunch = new BunchThread()
    // unLinkStocks.forEach((stockItem) => {
    //   bunch.taskCalling()
    // })
    bunch.register(unLinkStocks, (stockItem: StringObject): Promise<void> => {
      return new Promise(async (bunchResolve, bunchReject) => {
        try {
          await task(stockItem)
          return bunchResolve()
        } catch (error) {
          // 如果报错了就把失败的url重新推回 apis
          console.log(LogTag, error, stockItem['code'])
          apis.push(stockItem[apikey])
          return bunchReject()
        }
      })
    })
    .finally(() => {
      console.log(LogTag, 'end!')
      return resolve(apis)
    })
    .emit()
  })
}
