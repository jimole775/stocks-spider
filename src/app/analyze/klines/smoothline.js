// "2020-07-21,26.18,28.01,32.02,26.17,24354359,70439577904.00,22.38"
// 日期，开盘价，收盘价，最高价，最低价，成交量（手），成交额（元），振幅

// todo 每天开收盘不超过1个点，保持5个交易日，便形成U型底
// 然后根据U型底推演两边的边形态
// 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%

const fs = require('fs')
const path = require('path')
const theBottomWave = 0.01
const theLeftWave = 0.1
const theRightWave = 0.5
const seriesDaiesDvd = 4
const { readFileSync, writeFileSync, StockConnect, isEmptyObject } = global.utils
const save_dir = `smoothline`
const read_dir = `fr-klines/daily`
var a = {
  kline5: '',
  kline10: '',
  kline20: '',
  kline30: '',
}
module.exports = function smoothline () {
  // connectStock(read_dir, (fileData, stock, date) => {
  //   const [ulineLeftItems, ulineBottomItems, ulineRihtItems] = excution(fileData)
  //   console.log(ulineLeftItems, ulineBottomItems, ulineRihtItems)
  //   if (ulineBeginDaily && ulineEndDaily) {
  //     writeFileSync(path.join(global.path.db.api, save_dir, stock + '.json'), {
  //       code: fileData.code,
  //       name: fileData.name,
  //       ulineLeftItems,
  //       ulineBottomItems,
  //       ulineRihtItems,
  //     })
  //   }
  // })
  const connect = new StockConnect(read_dir)
  connect.on('data', (fileData, stock, date) => {
    const [ulineLeftItems, ulineBottomItems, ulineRihtItems] = excution(fileData)
    console.log(ulineLeftItems, ulineBottomItems, ulineRihtItems)
    if (ulineBeginDaily && ulineEndDaily) {
      writeFileSync(path.join(global.path.db.api, save_dir, stock + '.json'), {
        code: fileData.code,
        name: fileData.name,
        ulineLeftItems,
        ulineBottomItems,
        ulineRihtItems,
      })
    }
  })
  connect.emit()
}
// let fileData = fs.readFileSync('E:\\py_pro\\stocks-spider\\testdb\\603356\\fr-klines\\daily\\2020-07-23.json')
// const  [ulineLeftItems, ulineBottomItems, ulineRihtItems] = excution(JSON.parse(fileData))
// console.log(ulineLeftItems, ulineBottomItems, ulineRihtItems)
function excution (fileData) {
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
  const [leftpoint, rightpoint] = calcBottomSider(matchedMap, seriesDaiesDvd)
  if (leftpoint === null || rightpoint === null) return [null, null, null]
  console.log(leftpoint, rightpoint)

  // 边形必须超过振幅3个点以上，且开收盘超过2个点，两个边线向上, 持续3天以上，或者总体涨幅超过10 - 15%
  const ulineLeftItems = drawLeftSider(leftpoint, fileData.klines)
  const ulineRihtItems = drawRightSider(rightpoint, fileData.klines)

  const ulineBottomItems = storeBottomItems(leftpoint, rightpoint, fileData.klines)
  return [ulineLeftItems, ulineBottomItems, ulineRihtItems]
}

function calcBottomSider (matchedMap, seriesDaiesDvd) {
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
        leftpoint = Number.parseInt(loopKey)
      } else {
        rightpoint = null
      }
    }
  }

  return [leftpoint, rightpoint]
}

function storeBottomItems (leftpoint, rightpoint, klines) {
  const bottomItems = []
  for (let index = leftpoint; index <= rightpoint; index++) {
    const element = klines[index]
    bottomItems.push(element)
  }
  return bottomItems
}

function drawLeftSider (leftpoint, klines) {
  let [leftDate, leftOpenPrice, leftClosePrice] = klines[leftpoint].split(',')
  let isTrue = false
  const leftItems = []
  for (let j = leftpoint; j > leftpoint - 5; j -= 1) {
    const klineItem = klines[j]
    if (!klineItem) break
    leftItems.unshift(klineItem)
    const [date, openPrice] = klineItem.split(',')
    if (openPrice - leftOpenPrice > leftOpenPrice * theLeftWave) {
      // left边 属于跌落趋势，所以计算需要从右往左看
      isTrue = true
      break
    }
  }
  return isTrue ? leftItems : null
}

function drawRightSider (rightpoint, klines) {
  let [rightDate, rightOpenPrice, rightClosePrice] = klines[rightpoint].split(',')
  let isTrue = false
  const rightItems = []
  for (let k = rightpoint; k < rightpoint + 5; k += 1) {
    const klineItem = klines[k]
    if (!klineItem) break
    rightItems.push(klineItem)
    const [date, openPrice, closePrice] = klineItem.split(',')
    if (closePrice - rightClosePrice > rightClosePrice * theRightWave) {
      // right边 属于上涨趋势，所以计算需要从左往右看
      isTrue = true
      break
    }
  }
  return isTrue ? rightItems : null
}
