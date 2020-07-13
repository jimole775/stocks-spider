const quest = require(`./utils/quest`)
const moment = require('moment')
module.exports = async function () {

  // 命令行参数
  global.crossEnv = queryParam()
  global.module = global.crossEnv.module

  // 如果执行busy指令，那么，每次只有1个web访问，并且需要睡眠3秒
  // 主要是在公用WIFI中，不造成网络的负担
  global.onBusyNetwork = global.crossEnv.netstat === 'busy'
  global.sleepTimes = 3000 // 每一个访问的睡眠时长(ms)
  global.bunchLimit = global.onBusyNetwork ? 1 : 3

  // 从站点上获取最后一天的交易日期
  global.finalDealDate = await getDate()

  // vline模块配置项
  global.vline = {
    time_dvd : 15 * 60 * 1000, // v型k线的形成时间
    price_range : 0.05 // v型k线的深度
  }

  // kline模块配置项
  global.kline = {
    page_size: 120, // 每次采集多少个交易日的数据
  }
  
  // 资源路径别名
  global.srcRoot = __dirname
  global.urlModel = `${__dirname}\\url-model.yml`
  global.utils = `${__dirname}\\utils\\index.js`

  // 数据库别名
  global.db = `F:\\my_db\\stocks\\schedules`
  global.baseData = `F:\\my_db\\stocks\\base.json`

  return Promise.resolve(global)
}

function queryParam () {
  const res = {}
  if (process.argv && process.argv.length) {
    process.argv.forEach((item) => {
      if (item && /^\-\-.+/.test(item)) {
        const [key, value] = item.replace(/\-\-/, '').split('=')
        res[key] = value
      }
    })
  }
  return res
}

function getDate () {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  return new Promise(async (resolve, reject) => {
    try {
      const dirtyData = await quest('http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176')
      const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
      const curDate = new Date((pureData.data.time || 0) * 1000)
      return resolve(moment(curDate).format('YYYY-MM-DD'))
    } catch (error) {
      console.log('getdate: ', error)
      // 一般情况下，quest失败，不是网络异常，就是服务器异常，异常状态一般持续数秒或者数分钟，
      // 为了防止无谓的请求，增加1秒间隔，多少能减少一下资源浪费
      return setTimeout(() => { getDate() }, 1000)
    }
  })
}
