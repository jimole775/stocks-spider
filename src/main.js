;(async function (){
  await require('./global.config')()
  await require('./app/base/build-stocks-model')()
  await require('./app/base/build-dict')()
  console.log('is ok here')
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
  
  if (['strokeline', 'all'].includes(global.module)) {
    await analyzerDeals.strokeline()
  }

  if (['uline', 'all'].includes(global.module)) {
    await analyzerKlines.uline()
  }
  
  if (['lowerpoint', 'all'].includes(global.module)) {
    await analyzerKlines.lowerpoint()
  }

  if (['test'].includes(global.module)) {
    const fs = require('fs')
    const path = require('path')
    const base = require(global.baseData)
    const codeMap = {}
    const nameMap = {}
    base.data.forEach((stockItem) => {
      codeMap[stockItem.code] = stockItem.name
      nameMap[stockItem.name] = stockItem.code
    })
    fs.writeFileSync(path.join(global.db_dict, 'code-name.json'), JSON.stringify(codeMap))
    fs.writeFileSync(path.join(global.db_dict, 'name-code.json'), JSON.stringify(nameMap))
    // fs.writeFileSync(global.baseData, JSON.stringify(base))
  }

  process.exit()
})()
