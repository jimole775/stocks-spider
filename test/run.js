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
  for (const { p, v } of fileData.data) {
    min = min > p ? p : min
    max = max < p ? p : max
    sum += v
  }
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