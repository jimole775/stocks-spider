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

function cacal(store, fileData) {
  let sale_p = {} // 存储每个价格的成交额
  let overview = {} // 存储概览
  let min_p = 99999
  let max_p = 0
  let sum_v = 0
  let sum_p = 0
  let sum_p_v = 0 // 成交均价
  let start_p = 0 // 开盘价
  let end_p = 0 // 收盘价
  let diff_p = 0 // 振幅差价
  for (let { p, t, v } of fileData.data) {
    // 9:25分是开盘价, 9:25分之前的，都未成交
    if (t >= 92500) {
      p = p / 1000 // 先把 p 转换成正常的价格

      if(/^9250\d$/.test(t)) {
        start_p = p
      }

      min_p = min_p > p ? p : min_p
      max_p = max_p < p ? p : max_p

      sum_v += v // 总交易量计算
      sum_p += v * p * 100 // 总价计算

      saveSaleP(sale_p, p)
    }
  }

  sum_p_v = (sum_p / sum_v / 100).toFixed(2)

  // 直接获取最后一个价位
  end_p = (fileData.data[fileData.data.length - 1].p) / 1000

  // 振幅差价
  diff_p = ((max_p - min_p) / start_p * 100).toFixed(2) + '%'

  overview = analyzing(min_p, max_p, start_p, end_p, sum_v, sum_p, sum_p_v, diff_p)

  store[fileData.date] = { sale_p, overview }
}

function analyzing(min_p, max_p, start_p, end_p, sum_v, sum_p, sum_p_v, diff_p) {
  let downShadowSize = 0 // 下影线，开收盘价格相差在1%以内，并且当日最【低】价超过开盘价3-5%
  let upShadowSize = 0 // 上影线，开收盘价格相差在1%以内，并且当日最【高】价超过开盘价3-5%
  let isCrossShadow = false // 十字星，开收盘价格相差在1%以内，并且当日最【高】，最【低】价超过开盘价3-5%
  const res = { min_p, max_p, start_p, end_p, sum_v, sum_p, sum_p_v, diff_p, downShadowSize, upShadowSize, isCrossShadow }
  cacalDownShadow(res)
  cacalUpShadow(res)
  cacalCrossShadow(res)
  return res
}

function cacalDownShadow(base) {
  if (base.start_p > base.end_p && base.end_p > base.min_p) {
    // 绿色收盘
    base.downShadowSize = (base.end_p - base.min_p) / base.start_p * 100
  } else if (base.start_p < base.end_p && base.start_p > base.min_p) {
    // 红色收盘
    base.downShadowSize = (base.start_p - base.min_p) / base.start_p * 100
  } else if (base.start_p === base.end_p && base.end_p > base.min_p) {
    // 平盘
    base.downShadowSize = (base.end_p - base.min_p) / base.start_p * 100
  }
  base.downShadowSize = base.downShadowSize.toFixed(2) + '%'
  return base
}

function cacalUpShadow(base) {
  if (base.start_p > base.end_p && base.start_p < base.max_p) {
    // 绿色收盘
    base.upShadowSize = (base.max_p - base.start_p) / base.start_p * 100

  } else if (base.start_p < base.end_p && base.end_p < base.max_p) {
    // 红色收盘
    base.upShadowSize = (base.max_p - base.end_p) / base.start_p * 100

  } else if (base.start_p === base.end_p && base.end_p < base.max_p) {
    // 平盘
    base.upShadowSize = (base.max_p - base.end_p) / base.start_p * 100
  }
  base.upShadowSize = base.upShadowSize.toFixed(2) + '%'
  return base
}

function cacalCrossShadow(base) {
  if (mostEqual(base.upShadowSize, base.downShadowSize, 0.01)){
    base.isCrossShadow = true
  }
  return base
}

function saveSaleP(sale_p, p) {
  // 计算每个价位的成交额
  if (!sale_p[p * 100]) {
    // Math.round 主要处理js的运算误差
    sale_p[p * 100] = Math.round(v * p * 100)
  } else {
    // Math.round 主要处理js的运算误差
    sale_p[p * 100] += Math.round(v * p * 100)
  }
}
