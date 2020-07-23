;(async function (){
  await require('./global.config')()
  await require('./app/base/build-stocks-model')()

  const sniffStockHome = require('./app/base/sniff-stock-home')
  const sniffDailyDeals = require('./app/base/sniff-daily-deals')
  const analyzerDeals = require('./app/analyze/deals')
  const analyzerKlines = require('./app/analyze/klines')
  if (['kline', 'all'].includes(global.module)) {
    await sniffStockHome()
  }
  if (['deal', 'all'].includes(global.module)) {
    await sniffDailyDeals()
  }
  if (['shadowline', 'all'].includes(global.module)) {
    await analyzerDeals.shadowline()
  }
  if (['vline', 'all'].includes(global.module)) {
    await analyzerDeals.vline()
  }
  if (['uline', 'all'].includes(global.module)) {
    await analyzerKlines.uline()
  }
  process.exit()
})()