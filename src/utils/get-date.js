/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { Link } = require(`./link`)
const { quest } = require(`./quest`)
export function getDate() {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
  return new Promise(excution)
}

async function excution (s, j) {
  const dateReg = new RegExp('push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?', 'ig')
  const link = new Link('http://quote.eastmoney.com/zs000001.html')
  await link
    .on({
      response: response => {
        if (response.status() === 200 && dateReg.test(response.url())) {
          return responseEvent(response.url(), s, j)
        }
      }
    })
    .emit()
}

async function responseEvent(url, s, j) {
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  try {
    const dirtyData = await quest(url)
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    const curDate = new Date((pureData.data.time || 0) * 1000)
    let year = curDate.getFullYear()
    let mm = curDate.getMonth() + 1
    let dd = curDate.getDate()
    mm = mm.toString().length === 1 ? '0' + mm : mm
    dd = dd.toString().length === 1 ? '0' + dd : dd
    return s(`${year}-${mm}-${dd}`)
  } catch (error) {
    return responseEvent(url, s, j)
  }
}