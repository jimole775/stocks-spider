
const { quest } = require(`./utils`)
const moment = require('moment')
module.exports = async function () {
  global.srcRoot = __dirname
  global.baseUrl = 'src'
  global.bunchLimit = 3
  global.crossEnv = queryParam()
  global.module = global.crossEnv.module
  global.finalDealDate = await getDate()
  global.onBusyNetwork = global.crossEnv.netstat === 'busy'
  global.baseDataFile = `${__dirname}\\db\\warehouse\\base.json`
  return Promise.resolve(global)
}

function queryParam () {
  const res = {}
  if (process.argv && process.argv.length) {
    process.argv.forEach((item) => {
      if (item && /^\-\-.+/.test(item)) {
        const param = item.replace(/\-\-/, '').split('=')
        res[param[0]] = param[1]
      }
    })
  }
  return res
}

async function getDate () {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  try {
    const dirtyData = await quest('http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176')
    const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
    const curDate = new Date((pureData.data.time || 0) * 1000)
    return Promise.resolve(moment(curDate).format('YYYY-MM-DD'))
  } catch (error) {
    console.log('getdate: ', error)
    // 为了防止link访问丢失，增加1秒间隔，减少无谓的请求
    return setTimeout(() => { getDate() }, 1000)
  }
}
