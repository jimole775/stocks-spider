/** todo 增加一个维度，买入和卖出
 * 1. 上/下影线的形态描述
 * 线的长度取决于当日最高和最低价, 宽度取决于开盘和收盘价
 * 数据路径：F:\MyPro\stocks\src\db\analyze\deals\shadowline
 * return: 
 * {
    "sal_sum_pp": {
      "4.83": 9069774, // 存储每个价格的成交额
      ...
    },
    "buy_sum_pp": {
      "4.83": 9069774, // 存储每个价格的成交额
      ...
    },
    "overview": {
      "opn_pice": 5.05, // 开盘价
      "end_pice": 5.09, // 收盘价
      "min_pice": 4.83, // 最低价
      "max_pice": 5.16, // 最高价
      "buy_sum_v": 8238827, // 买入成交量
      "buy_sum_p": 4125515597, // 买入成交总额
      "sal_sum_v": 8238827, // 卖出成交量
      "sal_sum_p": 4125515597, // 卖出成交总额
      "buy_sum_p_v": "5.01", // 买入成交均价
      "sal_sum_p_v": "5.01", // 卖出成交均价
      "waves_percent": "6.53%", // 最大振幅
      "downShadowSize": "4.36%", // 下影线长度
      "upShadowSize": "1.39%", // 上影线长度
      "isCrossShadow": false // 是否是十字星
    }
  }
 */
const path = require('path')
const dirRoot = `deals`
const targetRoot = `/analyze/deals/shadowline/`
const { rangeEqual, writeFileSync, readDirSync, connectStock } = require(global.utils)
module.exports = async function shadowline() {
  // 花 1分钟 时间，把已经存过的过滤出来
  const ignoreDateFiles = unrecordFiles(targetRoot)
  connectStock(dirRoot, ignoreDateFiles, (fileData, stock, date) => {
    if (!fileData || !fileData.data) return false
    const analyzeData = calculate(fileData)
    writeFileSync(path.join(global.db_stocks, stock, targetRoot, date + '.json'), analyzeData)
  })
  return Promise.resolve(true)
}

function unrecordFiles (targetDir) {
  const dbPath = global.db_stocks
  const allStocks = require(global.baseData).data
  const result = {
    // [stockCode]: [unRecoedDateFiles]
  }

  allStocks.forEach(({ code }) => {
    const dateFiles = readDirSync(path.join(dbPath, code, targetDir))
    result[code] = dateFiles
  })

  return {
    ignoreCodes: [],
    ignoreDates: []
  }
}

function calculate(fileData) {
  const opn_pice = fileData.cp / 1000 // 开盘价
  const end_pice = fileData.ep / 1000 // 收盘价
  const min_pice = fileData.dp / 1000 // 最低价
  const max_pice = fileData.hp / 1000 // 最高价
  let buy_sum_pp = {} // 存储每个价格的买入成交额
  let sal_sum_pp = {} // 存储每个价格的卖出成交额
  let buy_sum_v = 0 // 买入手数
  let buy_sum_p = 0 // 买入总额
  let sal_sum_v = 0 // 卖入手数
  let sal_sum_p = 0 // 卖入总额
  let buy_sum_p_v = 0 // 买入均价
  let sal_sum_p_v = 0 // 卖出均价
  let waves_percent = 0 // 振幅%
  let downShadowSize = 0 // 下影线%
  let upShadowSize = 0 // 上影线%
  let isCrossShadow = false // 十字星

  for (let { p, t, v, bs } of fileData.data) {
    // 9点25分之前的数据都不算
    if (t < 92500) continue
    p = p / 1000 // 先把 p 转换成正常的价格

    if (bs === 1) {

      sal_sum_v += v // 总交易量计算
      sal_sum_p += v * p * 100 // 总价计算

      sal_sum_pp = recordPP(sal_sum_pp, v, p)
    }

    if (bs === 2) {

      buy_sum_v += v // 总交易量计算
      buy_sum_p += v * p * 100 // 总价计算

      buy_sum_pp = recordPP(buy_sum_pp, v, p)
    }
    
  }

  // 求平均一股的价格
  buy_sum_p_v = (buy_sum_p / (buy_sum_v * 100)).toFixed(2)
  sal_sum_p_v = (sal_sum_p / (sal_sum_v * 100)).toFixed(2)

  // 振幅差价
  waves_percent = ((max_pice - min_pice) / opn_pice).toFixed(2)

  // overview = analyzing(min_pice, max_pice, opn_pice, end_pice, sum_v, sum_p, sum_p_v, waves_percent)
  upShadowSize = calculateUpShadow(opn_pice, end_pice, min_pice)
  downShadowSize = calculateDownShadow(opn_pice, end_pice, min_pice)
  isCrossShadow = calculateCrosShadow(upShadowSize, downShadowSize)
  return {
    buy_sum_pp,
    sal_sum_pp,
    overview: {
      min_pice,
      max_pice,
      opn_pice,
      end_pice,
      buy_sum_v,
      buy_sum_p,
      sal_sum_v,
      sal_sum_p,
      buy_sum_p_v,
      sal_sum_p_v,
      upShadowSize,
      waves_percent,
      downShadowSize,
      isCrossShadow
    }
  }
}

function calculateDownShadow (opn_pice, end_pice, min_pice) {
  let downShadowSize = 0
  if (opn_pice > end_pice && end_pice > min_pice) {
    // 绿色收盘
    downShadowSize = (end_pice - min_pice) / opn_pice * 100
  } else if (opn_pice < end_pice && opn_pice > min_pice) {
    // 红色收盘
    downShadowSize = (opn_pice - min_pice) / opn_pice * 100
  } else if (opn_pice === end_pice && end_pice > min_pice) {
    // 平盘
    downShadowSize = (end_pice - min_pice) / opn_pice * 100
  }
  return downShadowSize.toFixed(2)
}

function calculateUpShadow (opn_pice, end_pice, max_pice) {
  let upShadowSize = 0
  if (opn_pice > end_pice && opn_pice < max_pice) {
    // 绿色收盘
    upShadowSize = (max_pice - opn_pice) / opn_pice * 100

  } else if (opn_pice < end_pice && end_pice < max_pice) {
    // 红色收盘
    upShadowSize = (max_pice - end_pice) / opn_pice * 100

  } else if (opn_pice === end_pice && end_pice < max_pice) {
    // 平盘
    upShadowSize = (max_pice - end_pice) / opn_pice * 100
  }
  return upShadowSize.toFixed(2)
}

function calculateCrosShadow(upShadowSize, downShadowSize) {
  return rangeEqual(upShadowSize, downShadowSize, 0.01)
}

function recordPP(pp, v, p) {
  // 计算每个价位的成交额
  p = p.toFixed(2)
  if (!pp[p]) {
    // Math.round 主要处理js的运算误差
    pp[p] = Math.round(v * p * 100)
  } else {
    // Math.round 主要处理js的运算误差
    pp[p] += Math.round(v * p * 100)
  }
  return pp
}

