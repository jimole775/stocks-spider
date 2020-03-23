/**
 * 1. 上/下影线的形态描述
 * 线的长度取决于当日最高和最低价, 宽度取决于开盘和收盘价
 */
import fs from 'fs'
import path from 'path'
const { rangeEqual, readFile, writeFile } = require(`${global.srcRoot}/utils`)
export async function shadowLines() {
  const dir = `${global.srcRoot}/db/warehouse/peer-deals/2020-03-23`
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const data = await readFile(filePath)
    const analyzeData = cacal(data)
    const res = writeFile(`${global.srcRoot}/db/analyze/peer-deals/2020-03-23/${file}`, analyzeData)
    console.log(file, res)
  }
}

function cacal(fileData) {
  const dayItem = {}
  const simpItem = {}
  let analyzeModel = {}
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

  analyzeModel = analyzing(min_p, max_p, start_p, end_p, sum_v)

  // 以百分比计算
  // for (const { p, v } of fileData.data) {
  //   if (!dayItem[p]) {
  //     dayItem[p] = (v / sum_v) * 100
  //   } else {
  //     dayItem[p] += (v / sum_v) * 100
  //   }
  // }
  
  // for (const [key, val] of Object.entries(dayItem)) {
    // if (val > 1) simpItem[key] = val.toFixed(2) + '%'
    // console.log(aaa)
  // }

  return analyzeModel
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