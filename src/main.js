;(async function (){
  await require('./global.config')()
  await require('./app/base/build-stocks-model')()
  
  const sniffStockHome = require('./app/base/sniff-stock-home')
  const sniffDailyDeals = require('./app/base/sniff-daily-deals')
  const { shadowLines } = require('./app/analyze/peer-deals')
  if (['kline', 'all'].includes(global.crossEnv.type)) {
    await sniffStockHome()
  }
  if (['deal', 'all'].includes(global.crossEnv.type)) {
    await sniffDailyDeals()
    await shadowLines()
  }
  process.exit()
})()