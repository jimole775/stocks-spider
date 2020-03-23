require('@babel/register') // 转接外部模块的加载方式，amd改为common
require('./global.config')
const { webHome } = require ('./app/base/web-home')
const { getDate } = require ('./utils')
const { buildStocksModel } = require ('./app/base/build-stocks-model')
const { sniffStockHome } = require ('./app/base/sniff-stock-home')
const { sniffDailyDeals } = require ('./app/base/sniff-daily-deals')
require ('./app/analyze/peer-deals')
;(async function (){
  // global.finalDate = await getDate() // 先截取最后一个交易日的时间
  // await buildStocksModel()
  // sniffStockHome()
  // sniffDailyDeals()
})()
