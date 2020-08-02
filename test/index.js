const fs = require('fs')
const path = require('path')
function run() {
  const dir = './test/db'
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
  let analyze = {}
  let min_p = 99999
  let max_p = 0
  let sum_v = 0
  let start_p = 0 // 开盘价
  let end_p = 0 // 收盘价
  let diff_p = 0 // 振幅差价
  for (const { p, t, v } of fileData.data) {
    // 9:25分是开盘价
    if(/^9250\d$/.test(t)) {
      start_p = p
    }
    min_p = min_p > p ? p : min_p
    max_p = max_p < p ? p : max_p
    sum_v += v
  }

  // 直接获取最后一个价位
  end_p = fileData.data[fileData.data.length - 1].p

  // 振幅差价
  diff_p = max_p - min_p

  analyze = analyzing(min_p, max_p, start_p, end_p, sum_v)

  // 以百分比计算
  for (const { p, v } of fileData.data) {
    if (!dayItem[p]) {
      dayItem[p] = (v / sum_v) * 100
    } else {
      dayItem[p] += (v / sum_v) * 100
    }
  }
  
  for (const [key, val] of Object.entries(dayItem)) {
    // if (val > 1) simpItem[key] = val.toFixed(2) + '%'
    // console.log(aaa)
  }

  store[fileData.date] = { simpItem, analyze }
}

function analyzing(min_p, max_p, start_p, end_p, sum_v) {
  let isDownShadow = false // 下影线，开收盘价格相差在1%以内，并且当日最【低】价超过开盘价3-5%
  let isUpShadow = false // 上影线，开收盘价格相差在1%以内，并且当日最【高】价超过开盘价3-5%
  let isCrossShadow = false // 十字星，开收盘价格相差在1%以内，并且当日最【高】，最【低】价超过开盘价3-5%
  const res = { min_p, max_p, start_p, end_p, sum_v, isDownShadow, isUpShadow, isCrossShadow }
  if (rangeEqual(end_p, start_p, 0.01)) {
    if (max_p - start_p >= start_p * 0.03) {
      res['isUpShadow'] = true
    }
    if (start_p - min_p >= start_p * 0.03) {
      res['isDownShadow'] = true
    }
    if (rangeEqual(start_p - min_p, max_p - start_p, 0.01)) {
      res['isCrossShadow'] = true
    }
  }
  return res
}

function rangeEqual(a = 0, b = 0, range = 0) {
  return a >= b && a <= b * (1 + range) || a <= b && a * (1 + range) >= b
}

run()
