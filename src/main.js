;(async function (){
  await require('./global.config')()
  await require('./app/base/build-stocks-model')()

  const sniffStockHome = require('./app/base/sniff-stock-home')
  const sniffDailyDeals = require('./app/base/sniff-daily-deals')
  const analyzer = require('./app/analyze/deals')
  if (['kline', 'all'].includes(global.module)) {
    await sniffStockHome()
  }
  if (['deal', 'all'].includes(global.module)) {
    await sniffDailyDeals()
  }
  if (['shadowline', 'all'].includes(global.module)) {
    await analyzer.shadowline()
  }
  if (['vline', 'all'].includes(global.module)) {
    await analyzer.vline()
  }
  process.exit()
})()