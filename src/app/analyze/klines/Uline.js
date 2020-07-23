
// "2020-07-21,26.18,28.01,32.02,26.17,24354359,70439577904.00,22.38"
// 日期，开盘价，收盘价，最高价，最低价，成交量（手），成交额（元），振幅

// todo 每天开收盘不超过1个点，保持5个交易日，便形成U型底
// 然后根据U型底推演两边的边形态
// 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%
const fs = require('fs')
const path = require('path')
const maxWave = 0.03
const maxPillar = 0.01
const seriesDaiesDvd = 4
;(() => {
  let fileData = fs.readFileSync('E:\\py_pro\\stocks-spider\\testdb\\603356\\klines\\daily\\2020-07-22.json', 'utf8')
  const daiesMap = {}
  const mathedMap = {}
  fileData = JSON.parse(fileData)
  fileData.klines.forEach((daily, index) => {
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = daily.split(',')
    if (Math.abs(closePrice - openPrice) < openPrice * maxPillar) {
      daiesMap[index] = daily
      if (daiesMap[index - 1]) {
        mathedMap[index - 1] = daiesMap[index - 1]
        mathedMap[index] = daiesMap[index]
      }
    }
  })
  console.log(mathedMap)
  // 计算【U型底】的两个边的起始下标
  let leftpoint = null
  let rightpoint = null
  const keys = Object.keys(mathedMap)
  for (let i = keys.length; i >= 0; i -= 1) {
    const key = keys[i]
    if (leftpoint && rightpoint) break;
    // 最起码 mathedMap[x] 和 mathedMap[x - 4] 有值
    if (i >= seriesDaiesDvd && mathedMap[Number.parseInt(key) - seriesDaiesDvd]) {
      if (!rightpoint) rightpoint = Number.parseInt(key) // 确定 【U型底】 的右边下标
      let loopKey = key

      // 验证连续性
      while(loopKey -= 1) {
        if (!mathedMap[loopKey]) {
          loopKey += 1
          break
        }
      }

      // 如果确定连续性的间距大于 seriesDaiesDvd，
      // 那么就可以确定 【U型底】 的左边下标了
      if (rightpoint - loopKey >= seriesDaiesDvd) {
        leftpoint = Number.parseInt(loopKey)
      }
    }
  }
  console.log(leftpoint, rightpoint)
  // 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%
  let leftDailyItem = null
  let rightDailyItem = null
  let [leftDate, leftOpenPrice, leftClosePrice] = fileData.klines[leftpoint].split(',')
  let [rightDate, rightOpenPrice, rightClosePrice] = fileData.klines[rightpoint].split(',')
  for (let j = leftpoint; j > leftpoint - 5; j -= 1) {
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = fileData.klines[j].split(',')
    if (Number.parseFloat(openPrice) - Number.parseFloat(leftOpenPrice) > Number.parseFloat(leftOpenPrice) * 0.1) {
      // left边 属于跌落趋势，所以计算需要从右往左看
      leftDailyItem = fileData.klines[j]
      break
    }
  }

  for (let k = rightpoint; k < rightpoint + 5; k += 1) {
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = fileData.klines[k].split(',')
    if (Number.parseFloat(closePrice) - Number.parseFloat(rightClosePrice) > Number.parseFloat(rightClosePrice) * 0.1) {
      // left边 属于跌落趋势，所以计算需要从右往左看
      rightDailyItem = fileData.klines[k]
      break
    }
  }

  console.log(leftDailyItem, rightDailyItem)
})()
