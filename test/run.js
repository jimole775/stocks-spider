const fs = require('fs')
const path = require('path')
function run() {
  const dir = './db'
  const files = fs.readdirSync(dir)
  // p: 价格
  // v: 成交数
  const store = {}
  for (const file of files) {
    const filePath = path.join(dir, file)
    const data = fs.readFileSync(filePath, 'utf8')
    cacal(store, JSON.parse(data))
  }
  console.log(store)
}

function cacal(store, fileData) {
  const dayItem = {}
  const simpItem = {}
  let min = 0
  let max = 1
  let sum = 0
  let start_p = 0 // 开盘价
  let end_p = 0 // 收盘价
  let diff_p = 0 // 振幅差价
  let isDownShadow = false // 下影线，开收盘价格相差在1%以内，并且当日最【低】价超过开盘价3-5%
  let isUpShadow = false // 上影线，开收盘价格相差在1%以内，并且当日最【高】价超过开盘价3-5%
  let isCrossShadow = false // 十字星，开收盘价格相差在1%以内，并且当日最【高】，最【低】价超过开盘价3-5%
  for (const { p, t, v } of fileData.data) {
    // 9:25分是开盘价
    if(/^9250\d$/.test(t)) {
      start_p = p
    }
    min = min > p ? p : min
    max = max < p ? p : max
    sum += v
  }

  // 直接获取最后一个价位
  end_p = fileData.data[fileData.data.length - 1].p

  // 振幅差价
  diff_p = max - min

  // 以百分比计算
  for (const { p, v } of fileData.data) {
    if (!dayItem[p]) {
      dayItem[p] = (v / sum) * 100
    } else {
      dayItem[p] += (v / sum) * 100
    }
  }
  
  for (const [key, val] of Object.entries(dayItem)) {

    // if (val > 1) simpItem[key] = val.toFixed(2) + '%'
    // console.log(aaa)
  }
  store[fileData.date] = simpItem
}

run()