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
import path from 'path'
const dirRoot = `deals`
const targetRoot = `/analyze/deals/shadowline/`
import { NumberObject } from '@/types/common'
import { TextDealModel, TextDealModelFromJson, StockStoreModel } from '@/types/stock'
export default async function shadowline() {
  const { assert, writeFileSync, readDirSync, StockConnect } = global.$utils
  // 花 1分钟 时间，把已经存过的过滤出来
  const ignoreDateFiles = unrecordFiles(targetRoot)
  const connect = new StockConnect(dirRoot, ignoreDateFiles)
  connect.on({
    data: (fileData: TextDealModel, stock: string, date: string): Promise<any> => {
      if (fileData.dt === 0) {
        const oldData = fileData as TextDealModelFromJson
        if (!oldData || !oldData.data) return Promise.resolve()
        const analyzeData = calculate(oldData)
        writeFileSync(path.join(global.$path.db.stocks, stock, targetRoot, date + '.json'), analyzeData)
      }
      return Promise.resolve()
    }
  })
  connect.emit()
  return Promise.resolve(true)
}

function unrecordFiles (targetDir: string): { codes: [], dates: [] } {
  const { readDirSync } = global.$utils
  const dbPath = global.$path.db.stocks
  const allStocks: StockStoreModel[] = require(global.$path.db.base_data).data
  const result: {[key: string]: any} = {
    // [stockCode]: [unRecoedDateFiles]
  }

  allStocks.forEach((recordItem: StockStoreModel) => {
    const dateFiles = readDirSync(path.join(dbPath, recordItem.code, targetDir))
    result[recordItem.code] = dateFiles
  })

  return {
    codes: [],
    dates: []
  }
}

function calculate(fileData: TextDealModelFromJson) {
  const opn_pice = fileData.cp / 1000 // 开盘价
  const end_pice = fileData.ep / 1000 // 收盘价
  const min_pice = fileData.dp / 1000 // 最低价
  const max_pice = fileData.hp / 1000 // 最高价
  let buy_sum_pp: NumberObject = {} // 存储每个价格的买入成交额
  let sal_sum_pp: NumberObject = {} // 存储每个价格的卖出成交额
  let buy_sum_v = 0 // 买入手数
  let buy_sum_p = 0 // 买入总额
  let sal_sum_v = 0 // 卖入手数
  let sal_sum_p = 0 // 卖入总额
  let buy_sum_p_v: string = '0' // 买入均价
  let sal_sum_p_v: string = '0' // 卖出均价
  let waves_percent: string = '0' // 振幅%
  let downShadowSize: string = '0' // 下影线%
  let upShadowSize: string = '0'// 上影线%
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

function calculateDownShadow (opn_pice: number, end_pice: number, min_pice: number): string {
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

function calculateUpShadow (opn_pice: number, end_pice: number, max_pice: number): string {
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

function calculateCrosShadow(upShadowSize: string, downShadowSize: string): boolean {
  const { assert } = global.$utils
  return assert.rangeEqual(upShadowSize, downShadowSize, 0.01)
}

function recordPP(pp: NumberObject, v: number, p: number): NumberObject {
  // 计算每个价位的成交额
  const price: string = p.toFixed(2)
  if (!pp[price]) {
    // Math.round 主要处理js的运算误差
    pp[price] = Math.round(v * Number(price) * 100)
  } else {
    // Math.round 主要处理js的运算误差
    pp[price] += Math.round(v * Number(price) * 100)
  }
  return pp
}
