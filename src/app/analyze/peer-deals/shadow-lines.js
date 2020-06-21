/** todo 增加一个维度，买入和卖出
 * 1. 上/下影线的形态描述
 * 线的长度取决于当日最高和最低价, 宽度取决于开盘和收盘价
 * 数据路径：F:\MyPro\stocks\src\db\analyze\peer-deals\shadowlines
 * return: 
 * {
    "sale_p": {
      "4.83": 9069774, // 存储每个价格的成交额
      ...
    },
    "overview": {
      "min_p": 4.83, // 最低价
      "max_p": 5.16, // 最高价
      "open_p": 5.05, // 开盘价
      "end_p": 5.09, // 收盘价
      "sum_v": 8238827, // 成交量
      "sum_p": 4125515597, // 成交总额
      "sum_p_v": "5.01", // 成交均价
      "diff_p": "6.53%", // 最大振幅
      "downShadowSize": "4.36%", // 下影线长度
      "upShadowSize": "1.39%", // 上影线长度
      "isCrossShadow": false // 是否是十字星
    }
  }
 */
const fs = require('fs')
const path = require('path')
const dirRoot = `${global.srcRoot}/db/warehouse/peer-deals/`
const targetRoot = `${global.srcRoot}/db/analyze/peer-deals/shadowlines/`
const { rangeEqual, readFileSync, writeFileSync } = require(`${global.srcRoot}/utils`)
module.exports = async function shadowLines() {
  const dateFolders = fs.readdirSync(dirRoot)
  for (const dateFolder of dateFolders) {
    const wareFiles = fs.readdirSync(path.join(dirRoot, dateFolder))
    if (fs.existsSync(path.join(targetRoot, dateFolder))) {
      const analyzeFiles = fs.readdirSync(path.join(targetRoot, dateFolder))
      if (wareFiles.length === analyzeFiles.length) continue
    }
    for (const file of wareFiles) {
      const filePath = path.join(dirRoot, dateFolder, file)
      const fileData = await readFileSync(filePath)
      if (!fileData || !fileData.data) continue
      const analyzeData = cacal(fileData)
      await writeFileSync(path.join(targetRoot, dateFolder, file), analyzeData)
    }
  }
  return Promise.resolve(true)
}

function isExist (dateFolder) {

}

function cacal(fileData) {
  let sale_p = {} // 存储每个价格的成交额
  let overview = {} // 存储概览
  let min_p = 99999
  let max_p = 0
  let sum_v = 0
  let sum_p = 0
  let sum_p_v = 0 // 成交均价
  let open_p = fileData.cp / 1000 // 开盘价
  let end_p = 0 // 收盘价
  let diff_p = 0 // 振幅差价
  for (let { p, t, v } of fileData.data) {
    
    // 9点25分之前的数据都不算
    if (t < 92500) break
  
    p = p / 1000 // 先把 p 转换成正常的价格

    // 存储收盘价
    if(/^1500/.test(t)) {
      end_p = p
    }

    min_p = min_p > p ? p : min_p
    max_p = max_p < p ? p : max_p

    sum_v += v // 总交易量计算
    sum_p += v * p * 100 // 总价计算

    saveSaleP(sale_p, v, p)
  
  }

  sum_p_v = (sum_p / sum_v / 100).toFixed(2)

  // 振幅差价
  diff_p = ((max_p - min_p) / open_p * 100).toFixed(2) + '%'

  overview = analyzing(min_p, max_p, open_p, end_p, sum_v, sum_p, sum_p_v, diff_p)

  return { sale_p, overview }
}

function analyzing(min_p, max_p, open_p, end_p, sum_v, sum_p, sum_p_v, diff_p) {
  let downShadowSize = 0 // 下影线，开收盘价格相差在1%以内，并且当日最【低】价超过开盘价3-5%
  let upShadowSize = 0 // 上影线，开收盘价格相差在1%以内，并且当日最【高】价超过开盘价3-5%
  let isCrossShadow = false // 十字星，开收盘价格相差在1%以内，并且当日最【高】，最【低】价超过开盘价3-5%
  let res = { min_p, max_p, open_p, end_p, sum_v, sum_p, sum_p_v, diff_p, downShadowSize, upShadowSize, isCrossShadow }
  res = cacalDownShadow(res)
  res = cacalUpShadow(res)
  res = cacalCrossShadow(res)
  return res
}

function cacalDownShadow(base) {
  if (base.open_p > base.end_p && base.end_p > base.min_p) {
    // 绿色收盘
    base.downShadowSize = (base.end_p - base.min_p) / base.open_p * 100
  } else if (base.open_p < base.end_p && base.open_p > base.min_p) {
    // 红色收盘
    base.downShadowSize = (base.open_p - base.min_p) / base.open_p * 100
  } else if (base.open_p === base.end_p && base.end_p > base.min_p) {
    // 平盘
    base.downShadowSize = (base.end_p - base.min_p) / base.open_p * 100
  }
  base.downShadowSize = base.downShadowSize.toFixed(2) + '%'
  return base
}

function cacalUpShadow(base) {
  if (base.open_p > base.end_p && base.open_p < base.max_p) {
    // 绿色收盘
    base.upShadowSize = (base.max_p - base.open_p) / base.open_p * 100

  } else if (base.open_p < base.end_p && base.end_p < base.max_p) {
    // 红色收盘
    base.upShadowSize = (base.max_p - base.end_p) / base.open_p * 100

  } else if (base.open_p === base.end_p && base.end_p < base.max_p) {
    // 平盘
    base.upShadowSize = (base.max_p - base.end_p) / base.open_p * 100
  }
  base.upShadowSize = base.upShadowSize.toFixed(2) + '%'
  return base
}

function cacalCrossShadow(base) {
  if (rangeEqual(base.upShadowSize, base.downShadowSize, 0.01)){
    base.isCrossShadow = true
  }
  return base
}

function saveSaleP(sale_p, v, p) {
  // 计算每个价位的成交额
  p = p.toFixed(2)
  if (!sale_p[p]) {
    // Math.round 主要处理js的运算误差
    sale_p[p] = Math.round(v * p * 100)
  } else {
    // Math.round 主要处理js的运算误差
    sale_p[p] += Math.round(v * p * 100)
  }
}
