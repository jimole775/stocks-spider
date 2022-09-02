/**
 * 以http/json类型的方式访问获取的数据类型
 */
export type TextDealModelFromJson = {
  c: string // code
  m: number // market 0: 1:
  n: string // name
  dt: number // dt = 0
  ct: number
  cp: number
  tc: number
  data: { t: number, p: number, v: number, bs: number }[]
  hp: number // 当日最高价
  dp: number // 当日最低价
  ep: number // 当日收盘价
}

/**
 * 以http/stream类型的方式访问获取的数据类型
 */
export type TextDealModelFromStream = {
  code: string
  market: number // market 0: 1:
  decimal: number
  prePrice: number
  details: string[]
  dt: number // dt = 1
  hp: number // 当日最高价
  dp: number // 当日最低价
  ep: number // 当日收盘价
}

export type TextDealModel = TextDealModelFromJson | TextDealModelFromStream

export type SQLDealModel = {
  price: number // 价格
  date: string // 日期
  time: string // 交易时间
  volumn: number // 每笔交易量
  deal_type: number // 交易类型
  data_type: number // 数据类型
  market: number // 市场类型
  highest_price: number // 最高价
  lowest_price: number // 最低价
  end_price: number // 收盘价
}

export type TextKlineModel = {
  code: string,
  market: number,
  name: string,
  decimal: number,
  dktotal: number,
  klines: string[]
}
