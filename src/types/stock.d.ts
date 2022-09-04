export enum StockMarket {
  ShenZhen = 0,
  ShangHai = 1,
}

/**
 * 以http/json类型的方式访问获取的数据类型
 */
export type TextDealModelFromJson = {
  c: string // code
  m: StockMarket // market 0: 1:
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
  market: StockMarket // market 0: 1:
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
  market: StockMarket // 市场类型
  highest_price: number // 最高价
  lowest_price: number // 最低价
  end_price: number // 收盘价
}

export type TextKlineModel = {
  code: string,
  market: StockMarket,
  name: string,
  decimal: number,
  dktotal: number,
  klines: string[]
}

export type DealApiStore = {
  _: string
  cb: string
  ut: string
  secid: string
}

export type KlineApiStore = {
  _: string
  ut: string
  cb: string
  id: string
  dt: number
}

export type RecordItem = DealApiStore | KlineApiStore

export type StockStoreModel = {
  code: string,
  mCode: StockMarket,
  name: string, 
  klineApi?: KlineApiStore,
  dealApi?: DealApiStore
}

export type BaseData = StockStoreModel[]

export type BaseDataStructure = { date: number, data: BaseData }

export type UrlModel = {
  page: {
    Home: string
    SHome: string // 上证指数
    AHome: string // A股指数
    SHStockList: string // 上海股票列表
    SZStockList: string // 深圳股票列表
  }
  model: {
    StockHome: string // 个股主页的URL模型
    PeerDeal: string // 每笔交易列表页面URL模型
    KLineImg: string // 个股每日交易的K线图片的URL模型
  }
  api: {
    baseInfo: string // 个股基本面信息
    halfMMKline: string // 半月K线
    dailyKline: string // 不复权 日K线
    dailyKlineReg: string // 正则
    peerDeal: string // 每笔交易详情 | 旧版接口
    peerDealReg: string // 正则
    peerDeal1: string // 每笔交易详情 | 新版接口
    peerDealReg1: string
    quote: string // 报价信息（fileds只要“f530”就行，其他的用不到）
    quoteReg: string // 正则
  }
}
