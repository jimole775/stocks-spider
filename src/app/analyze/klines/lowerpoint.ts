import path from 'path'
import { TextKlineModel } from '@/types/stock';
const dailyRoot = `fr-klines/daily`
// const weekRoot = `klines/week`
// const monthRoot = `klines/month`
const writeDir = `lowerpoint` // `/api/lowerpoint/${date}`
// "2020-07-21,26.18,28.01,32.02,26.17,24354359,70439577904.00,22.38"
// 日期，开盘价，收盘价，最高价，最低价，成交量（手），成交额（元），振幅
const { writeFileSync, readDirSync, StockConnect } = global.$utils
export default function lowerpoint() {
  return new Promise((resolve, reject) => {
    const connect = new StockConnect(dailyRoot)
    connect.on({
      data: (fileData: TextKlineModel, stock: string, date: string): Promise<any> => {
        if (!fileData || !fileData.klines) return Promise.resolve()
        const [ avg01, avg05, avg10, avg20, avg30, avg60 ] = calculate(fileData)
        if (avg01 < avg05 && avg05 < avg10 && avg10 < avg20 && avg20 < avg30 && avg30 < avg60) {
          writeFileSync(path.join(global.$path.db.api, writeDir, date, stock + '.json'), { avg01, avg05, avg10, avg20, avg30, avg60 })
        }
        return Promise.resolve()
      },
      end: () => {
        resolve(true)
        return Promise.resolve()
      }
    })
    connect.emit()
  })
}

function calculate({ klines }: TextKlineModel) {
  let endIndex = klines.length - 1
  let [x, xx, endAvg] = klines[endIndex].split(',')
  let avg01 = Number(endAvg)
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
