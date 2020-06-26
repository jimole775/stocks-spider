// require('@babel/register') // 转接外部模块的加载方式，amd改为common
const fs = require('fs')
const path = require('path')
const readDirSync = require('./src/utils/read-dir-sync')
const readFileSync = require('./src/utils/read-file-sync')
const writeFileSync = require('./src/utils/write-file-sync')

// const { readDirSync, readFileSync, writeFileSync } = require('./src/utils')
// 取出 json 数据中的 date 数据，当作当前数据的文件名
const assianDir = './src/db/warehouse/daily-klines/2020-06-24'
const srcDir = './src/db/warehouse/peer-deals'
const targetDir = './src/db/warehouse/peer-deals-tmp'
// 2020-06-24 => stocks => {"code":"000001","market":0,"name":"平安银行","decimal":2,"dktotal":6959,"klines": ["2020-05-27,13.05...",""]}
// dates(2020-03-17~) => stocks => {"c":"000001","m":0,"n":"平安银行","ct":0,"cp":12760,"tc":4726, "data": []}

function getExtenData () {
  const klineData = {}
  const stockFolders = readDirSync(assianDir)
  stockFolders.forEach((stock) => {
    const stocklinedata = readFileSync(path.join(assianDir, stock))
    // const { stockCode, name, market, klines } = stocklinedata
    klineData[stocklinedata.code] = stocklinedata
    // klines.forEach((dailyDealPrices/*String*/) => {
    //   const [klinedate, open_p, ...others] = dailyDealPrices.split(',')

    // })
  })
  return klineData
}

peerDeals()

function peerDeals () {
  const klineData = getExtenData()
  const peerDeals_dateFolders = readDirSync(srcDir)
  for (let index = 0; index < peerDeals_dateFolders.length; index++) {
    const peerDeals_date = peerDeals_dateFolders[index]
    const peerDeals_stocks = readDirSync(path.join(srcDir, peerDeals_date))
    peerDeals_stocks.forEach((peerDeals_stock) => {
      const deals/*Array*/ = readFileSync(path.join(srcDir, peerDeals_date, peerDeals_stock))
      const [stockCode] = peerDeals_stock.split('.')
      const thisStockKline = klineData[stockCode]
      const { code, market, name, klines } = thisStockKline
      console.log(code)
      for (let j = 0; j < klines.length; j++) {
        const [klinedate, open_p, ...others] = klines[j].split(',')
        if (klinedate === peerDeals_date) {
          const model = {
            "c":stockCode,"m":market,"n":name,"ct":0,"cp":Math.round(open_p * 1000),"tc": deals.length, "data": deals
          }
          writeFileSync(path.join(targetDir, klinedate, stockCode + '.json'), model)
          thisStockKline.klines.splice(j, 1)
          break
        }
      }
    })

    // if (klinedate === peerDeals_date) {
    //   const deals/*Array*/ = readFileSync(path.join(srcDir, dateFolder, stockCode + '.json'))
    //   const model = {
    //     "c":stockCode,"m":market,"n":name,"ct":0,"cp":Math.round(open_p * 1000),"tc":4726, "data": deals
    //   }
    //   writeFileSync(path.join(targetDir, dateFolder, stockCode + '.json'), model)
    //   break
    // }
  }
}

function backup (src, target) {
  const dateDirs = fs.readdirSync(srcDir)
  // dateDirs.forEach((dateDir) => {
  for (let index = 0; index < dateDirs.length; index++) {
    const dateDir = dateDirs[index]
    const stocks = fs.readdirSync(path.join(srcDir, dateDir))
    for (let _index = 0; _index < stocks.length; _index++) {
      const stock = stocks[_index];
      const data = readFileSync(path.join(srcDir, dateDir, stock))
      if (data) {
        writeFileSync(path.join(targetDir, dateDir, stock), data.data ? data.data : data)
      }
    }
  }
    // stocks.forEach(async (stock) => {
      // const data = await readFileSync(path.join(srcDir, dateDir, stock))
      // const stock = file.split('.').shift()
      // const date = moment(data.date).format('YYYY-MM-DD')
    // })
  // })
}
