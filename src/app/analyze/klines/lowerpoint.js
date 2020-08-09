const fs = require('fs')
const path = require('path')
const dailyRoot = `fr-klines/daily`
// const weekRoot = `klines/week`
// const monthRoot = `klines/month`
const writeDir = `lowerpoint` // `/api/lowerpoint/${date}`
// "2020-07-21,26.18,28.01,32.02,26.17,24354359,70439577904.00,22.38"
// 日期，开盘价，收盘价，最高价，最低价，成交量（手），成交额（元），振幅
const { rangeEqual, writeFileSync, readDirSync, connectStock } = require(global.utils)
module.exports = function lowerpoint() {
  // 花 1分钟 时间，把已经存过的过滤出来
  // const ignoreDateFiles = unrecordFiles(targetRoot)
  connectStock(dailyRoot, (fileData, stock, date) => {
    if (!fileData || !fileData.klines) return false
    const [ avg01, avg05, avg10, avg20, avg30, avg60 ] = calculate(fileData)
    // console.log(avg01, avg05, avg10, avg20, avg30)
    if (avg01 < avg05 && avg05 < avg10 && avg10 < avg20 && avg20 < avg30 && avg30 < avg60) {
      writeFileSync(path.join(global.db_api, writeDir, date, stock + '.json'), { avg01, avg05, avg10, avg20, avg30 })
    }
  })
  return Promise.resolve(true)
}

function unrecordFiles () {

}
// test()
// function test () {
//   const fileData = fs.readFileSync('E:\\py_pro\\stocks-spider\\testdb\\603356\\fr-klines\\daily\\2020-07-23.json')
//   if (!fileData) return
//   const [avg01, avg05, avg10, avg20, avg30] = calculate(JSON.parse(fileData))
//   console.log(avg01, avg05, avg10, avg20, avg30)
//   if (avg01 < avg05 && avg05 < avg10 && avg10 < avg20 && avg20 < avg30) {
//     fs.writeFileSync(path.join('123456.json'), JSON.stringify({ avg01, avg05, avg10, avg20, avg30 }))
//   }
// }

function calculate({ klines }) {
  let endIndex = klines.length - 1
  let [x, xx, avg01] = klines[endIndex].split(',')
  let avg05 = 0
  let avg10 = 0
  let avg20 = 0
  let avg30 = 0
  let avg60 = 0
  for (let index = endIndex; index >= klines.length - 5; index -= 1) {
    const [date, open, close] = klines[index].split(',')
    avg05 += Number.parseFloat(close)
  }
  for (let index = endIndex; index >= klines.length - 10; index -= 1) {
    const [date, open, close] = klines[index].split(',')
    avg10 += Number.parseFloat(close)
  }
  for (let index = endIndex; index >= klines.length - 20; index -= 1) {
    const [date, open, close] = klines[index].split(',')
    avg20 += Number.parseFloat(close)
  }
  for (let index = endIndex; index >= klines.length - 30; index -= 1) {
    const [date, open, close] = klines[index].split(',')
    avg30 += Number.parseFloat(close)
  }
  for (let index = endIndex; index >= klines.length - 60; index -= 1) {
    const [date, open, close] = klines[index].split(',')
    avg60 += Number.parseFloat(close)
  }
  
  return [
    Number.parseFloat((avg01/1).toFixed(2)),
    Number.parseFloat((avg05/5).toFixed(2)),
    Number.parseFloat((avg10/10).toFixed(2)),
    Number.parseFloat((avg20/20).toFixed(2)),
    Number.parseFloat((avg30/30).toFixed(2)),
    Number.parseFloat((avg60/60).toFixed(2))
  ]
}
