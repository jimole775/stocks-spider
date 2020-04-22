/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
// const { readFile } = require(`./read-file`)
const { batchLinkC } = require(`./batch-link-c`)
const { quest } = require(`./quest`)
export function getDate() {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
  return new Promise(excution)
}

function excution (s, j) {
  const dateReg = new RegExp('push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?', 'ig')
  batchLinkC(['http://quote.eastmoney.com/zs000001.html'], {
      onResponse: async response => {
        if (response.status() === 200 && dateReg.test(response.url())) {
          const res = await handle(response)
          if (res) {
            return s(res)
          } else {
            return loop (s, j)
          }
        }
      }
    })
}

function handle(response) {
  return new Promise(async (s, j) => {
    // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
    let res = null
    try {
      const dirtyData = await quest(response.url())
      const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
      const curDate = new Date((pureData.data.time || 0) * 1000)
      let year = curDate.getFullYear()
      let mm = curDate.getMonth() + 1
      let dd = curDate.getDate()
      mm = mm.toString().length === 1 ? '0' + mm : mm
      dd = dd.toString().length === 1 ? '0' + dd : dd
      res = `${year}-${mm}-${dd}`
    } catch (error) {
      res = null
    }
    return s(res)
  })
}