require('@babel/register') // 转接外部模块的加载方式，amd改为common
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { readFileAsync, writeFileAsync } = require('./src/utils/index')
// 取出 json 数据中的 date 数据，当作当前数据的文件名
const srcDir = './src/db/warehouse/daily-klines'
const targetDir = './src/db/warehouse/daily-klines-tmp'
;(() => {
  const files = fs.readdirSync(srcDir)
  files.forEach(async(file, index) => {
    const data = await readFileAsync(path.join(srcDir, file))
    const stock = file.split('.').shift()
    const date = moment(data.date).format('YYYY-MM-DD')
    await writeFileAsync(path.join(targetDir, `${stock}_${date}.json`), JSON.stringify(data))
  })
})()