import path from 'path'
import moment from 'moment'
import puppeteer from 'puppeteer' 
import { EventEmitter } from 'node:events'
import { quest } from './utils/quest'
import { cmdParam } from './utils/cmd_param'
import { readFileSync } from './utils/read_file_sync'
export default async function config(): Promise<any> {

  global.$env = 'prod'

  global.$blackName = /[ST|退]/

  // 命令行参数
  global.$crossEnv = cmdParam()
  global.$module = global.$crossEnv.module

  // 如果执行busy指令，那么，每次只有1个web访问，并且需要睡眠3秒
  // 主要是在公用WIFI中，不造成网络的负担
  global.$onBusyNetwork = global.$crossEnv.netstat === 'busy'
  global.$sleepTimes = 3000 // 每一个访问的睡眠时长(ms)
  global.$bunchLimit = global.$onBusyNetwork ? 1 : 7

  // 从站点上获取最后一天的交易日期
  global.$finalDealDate = await getDate()

  // vline模块配置项
  global.$vline = {
    time_dvd: 15 * 60 * 1000, // v型k线的形成时间
    price_range: 0.05, // v型k线的深度
    haevy_standard: 10 * 10000 // 大单的标准
  }

  // kline模块配置项
  global.$kline = {
    page_size: 120 // 每次采集多少个交易日的数据
  }

  global.$urlModel = readFileSync(path.resolve(__dirname, '../', 'url-model.yml'))
  global.Mysql = require(path.join(__dirname, 'db-utils\\mysql\\index'))

  // 资源路径别名
  global.$path = {
    root: path.resolve(__dirname, '../'),
    src: path.join(__dirname),
    utils: path.join(__dirname, 'utils'),
    db_utils: path.join(__dirname, 'db-utils'),
    db: {
      home: `G:\\my_db\\stocks-spider`,
      api: `G:\\my_db\\stocks-spider\\api`,
      dict: `G:\\my_db\\stocks-spider\\dict`,
      stocks: `G:\\my_db\\stocks-spider\\stocks`,
      base_data: `G:\\my_db\\stocks-spider\\base.json`
    }
  }

  global.$browser = await puppeteer.launch()

  global.$utils = require(path.join(__dirname, 'utils\\index'))
  return Promise.resolve()
}

function getDate(): Promise<string> {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  return new Promise(async (resolve, reject) => {
    try {
      const dirtyData: { data: string } = await quest('http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176')
      const pureData: { data: { time: number } } = JSON.parse(dirtyData.data.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
      const curDate: Date = new Date((pureData.data.time || 0) * 1000)
      const dateString: string = moment(curDate).format('YYYY-MM-DD')
      console.log(dateString)
      return resolve(dateString)
    } catch (error) {
      console.log('getdate: ', error)
      // 一般情况下，quest失败，不是网络异常，就是服务器异常，异常状态一般持续数秒或者数分钟，
      // 为了防止无谓的请求，增加1秒间隔，多少能减少一下资源浪费
      return setTimeout(() => { getDate() }, 1000)
    }
  })
}
