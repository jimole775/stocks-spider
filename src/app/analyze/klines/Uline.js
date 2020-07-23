
// "2020-07-21,26.18,28.01,32.02,26.17,24354359,70439577904.00,22.38"
// 日期，开盘价，收盘价，最高价，最低价，成交量（手），成交额（元），振幅

// todo 每天开收盘不超过1个点，保持5个交易日，便形成U型底
// 然后根据U型底推演两边的边形态
// 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%


// 返回的数据模型
var model = {
  "code": "000587",
  "leftSider": [],
  "bottom": [],
  "rightSider": []
}
const fs = require('fs')
const path = require('path')
const theBottomWave = 0.01
const seriesDaiesDvd = 4
const { readFileSync, writeFileSync, connectStock, isEmptyObject, unrecordFiles } = require(global.utils)
const save_dir = `uline`
const read_dir = `fr-klines/daily`
module.exports = function uline () {
  connectStock(read_dir, (fileData, stock, date)=> {
    const [ulineBeginDaily, ulineEndDaily] = excution(fileData)
    console.log(ulineBeginDaily, ulineEndDaily)
    if (ulineBeginDaily && ulineEndDaily) {
      writeFileSync(path.join(global.db_api, save_dir, stock + '.json'), {
        code: stock,
        ulineBeginDaily,
        ulineEndDaily
      })
    }
  })
// let fileData = readFileSync('G:\\my_db\\stocks-spider\\stocks\\002355\\fr-klines\\daily\\2020-07-23.json')
// const [ulineBeginDaily, ulineEndDaily] = excution(fileData)
// console.log(ulineBeginDaily, ulineEndDaily)
}
function excution (fileData) {
  // let fileData = readFileSync('G:\\my_db\\stocks-spider\\stocks\\002355\\fr-klines\\daily\\2020-07-23.json')
  const daiesMap = {}
  const matchedMap = {}
  fileData.klines.forEach((daily, index) => {
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = daily.split(',')
    if (Math.abs(closePrice - openPrice) < openPrice * theBottomWave) {
      daiesMap[index] = daily
      if (daiesMap[index - 1]) {
        matchedMap[index - 1] = daiesMap[index - 1]
        matchedMap[index] = daiesMap[index]
      }
    }
  })

  // 获取【U型底】的两个边的起始下标
  const [leftpoint, rightpoint] = calcBottomBothSides(matchedMap, seriesDaiesDvd)
  if (leftpoint === null || rightpoint === null) return [null, null]
  console.log(leftpoint, rightpoint)
  // 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%
  const ulineBeginDaily = drawLeftSider(leftpoint, fileData)
  const ulineEndDaily = drawRightSider(rightpoint, fileData)

  return [ulineBeginDaily, ulineEndDaily]
}

function calcBottomBothSides (matchedMap, seriesDaiesDvd) {
  // 获取【U型底】的两个边的起始下标
  let leftpoint = null
  let rightpoint = null
  const keys = Object.keys(matchedMap)

  // 倒序
  for (let i = keys.length; i >= 0; i -= 1) {
    const key = Number.parseInt(keys[i])

    // 取到值就返回
    if (leftpoint !== null && rightpoint !== null) break;

    // 最起码 matchedMap[x] 和 matchedMap[x - 4] 有值
    if (matchedMap[key - seriesDaiesDvd]) {
      if (!rightpoint) rightpoint = key // 确定 【U型底】 的右边下标
      let loopKey = key

      // 验证连续性
      while(loopKey -= 1) {
        if (!matchedMap[loopKey]) {
          loopKey += 1
          break
        }
      }
      // 如果确定连续性的间距大于 seriesDaiesDvd，
      // 那么就可以确定 【U型底】 的左边下标了
      if (rightpoint - loopKey >= seriesDaiesDvd) {
        console.log('loopKey:', loopKey)
        leftpoint = Number.parseInt(loopKey)
      } else {
        rightpoint = null
      }
    }
  }

  return [leftpoint, rightpoint]
}


function drawLeftSider (leftpoint, fileData) {
  if (leftpoint === null) return null
  let [leftDate, leftOpenPrice, leftClosePrice] = fileData.klines[leftpoint].split(',')
  let ulineBeginDaily = null
  for (let j = leftpoint; j > leftpoint - 5; j -= 1) {
    const klineItem = fileData.klines[j]
    if (!klineItem) break
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = klineItem.split(',')
    if (openPrice - leftOpenPrice > leftOpenPrice * 0.1) {
      // left边 属于跌落趋势，所以计算需要从右往左看
      ulineBeginDaily = klineItem
      break
    }
  }
  return ulineBeginDaily
}

function drawRightSider (rightpoint, fileData) {
  if (rightpoint === null) return null
  let [rightDate, rightOpenPrice, rightClosePrice] = fileData.klines[rightpoint].split(',')
  let ulineEndDaily = null
  for (let k = rightpoint; k < rightpoint + 5; k += 1) {
    const klineItem = fileData.klines[k]
    if (!klineItem) break
    const [date, openPrice, closePrice, highPrice, lowPrice, deals, dealSum, wave] = klineItem.split(',')
    if (closePrice - rightClosePrice > rightClosePrice * 0.05) {
      // right边 属于上涨趋势，所以计算需要从左往右看
      ulineEndDaily = klineItem
      break
    }
  }
  return ulineEndDaily
}