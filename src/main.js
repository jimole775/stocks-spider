// require('@babel/register') // 转接外部模块的加载方式，amd改为common
require('./global.config')
const { getDate } = require ('./utils')
const buildStocksModel = require ('./app/base/build-stocks-model')
const sniffStockHome = require ('./app/base/sniff-stock-home')
const sniffDailyDeals = require ('./app/base/sniff-daily-deals')
const { shadowLines } = require ('./app/analyze/peer-deals')

;(async function (){
  console.log('run start!')
  global.finalDealDate = await getDate() // 先截取最后一个交易日的时间
  global.baseData = await buildStocksModel()
  console.log('date: ', global.finalDealDate)
  if (['kline', 'all'].includes(global.crossEnv.type)) {
    await sniffStockHome()
  }
  if (['deal', 'all'].includes(global.crossEnv.type)) {
    await sniffDailyDeals()
    await shadowLines()
  }
  process.exit()
})()