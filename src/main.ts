import { StockStoreModel } from "./types/stock"

;(async function () {
  await require('./global.config').default()
  await require('./app/base/assistants/build-base-data').default()
  await require('./app/base/assistants/build-dict').default()

  if (['kline', 'quote', 'all'].includes(global.$module)) {
    console.log('Sniff stock home!')
    await require('./app/base/business/sniff-stock-home').default(global.$module)
  }


  if (['deal', 'all'].includes(global.$module)) {
    console.log('Sniff daily deals!')
    await require('./app/base/business/sniff-daily-deals').default()
  }

  const { default: analyzerDeals } = require('./app/analyze/deals')
  if (['shadowline', 'all'].includes(global.$module)) {
    console.log('Analyzes deals into shadowline!')
    await analyzerDeals.shadowline()
  }

  if (['vline', 'all'].includes(global.$module)) {
    console.log('Analyzes deals into vline!')
    await analyzerDeals.vline()
  }

  if (['strokeline', 'all'].includes(global.$module)) {
    console.log('Analyzes deals into strokeline!')
    await analyzerDeals.strokeline()
  }

  const { default: analyzerKlines } = require('./app/analyze/klines')
  if (['uline', 'all'].includes(global.$module)) {
    console.log('Analyzes klines into uline!')
    await analyzerKlines.uline()
  }
  
  if (['lowerpoint', 'all'].includes(global.$module)) {
    console.log('Analyzes klines into lowerpoint!')
    await analyzerKlines.lowerpoint()
  }

  if (['test'].includes(global.$module)) {
    const fs = require('fs')
    const path = require('path')
    const base = require(global.$path.db.base_data)
    const codeMap = {}
    const nameMap = {}
    base.data.forEach((stockItem: StockStoreModel) => {
      Object.defineProperty(codeMap, stockItem.code, {
        value: stockItem.name
      })
      Object.defineProperty(nameMap, stockItem.name, {
        value: stockItem.code
      })
    })
    fs.writeFileSync(path.join(global.$path.db.dict, 'code-name.json'), JSON.stringify(codeMap))
    fs.writeFileSync(path.join(global.$path.db.dict, 'name-code.json'), JSON.stringify(nameMap))
    // fs.writeFileSync(global.$path.db.base_data, JSON.stringify(base))
  }

  console.log('Process was end!')
  process.exit()
})()

export {}
