// require('@babel/register') // 转接外部模块的加载方式，amd改为common
const fs = require('fs')
const path = require('path')
const { readFileSync, writeFileSync } = require('./src/utils')
// 取出 json 数据中的 date 数据，当作当前数据的文件名
const srcDir = './src/db/warehouse/peer-deals'
const targetDir = './src/db/warehouse/peer-deals-tmp'
;(async () => {
  const dateDirs = fs.readdirSync(srcDir)
  // dateDirs.forEach((dateDir) => {
  for (let index = 0; index < dateDirs.length; index++) {
    const dateDir = dateDirs[index]
    const stocks = fs.readdirSync(path.join(srcDir, dateDir))
    for (let _index = 0; _index < stocks.length; _index++) {
      const stock = stocks[_index];
      const data = await readFileSync(path.join(srcDir, dateDir, stock))
      if (data) {
        await writeFileSync(path.join(targetDir, dateDir, stock), data.data ? data.data : data)
      }
    }
  }
    // stocks.forEach(async (stock) => {
      // const data = await readFileSync(path.join(srcDir, dateDir, stock))
      // const stock = file.split('.').shift()
      // const date = moment(data.date).format('YYYY-MM-DD')
    // })
  // })
})()
// {}
// {"c":"000001","m":0,"n":"平安银行","ct":0,"cp":12760,"tc":4726, "data": []}