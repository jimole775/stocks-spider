import { TextDealModel, TextDealModelFromJson, TextDealModelFromStream, SQLDealModel } from '@/types/stock'
require(`../../../global.config.js`)().then(async () => {
  const db_config = require(`${global.$path.root}/db_config.json`)
  const deals_ddl = require(`${global.$path.db_utils}/mysql/ddl/deals.json`)
  const { StockConnect } = global.$utils
  const mysql = new global.Mysql(db_config.deals)
  const connect = new StockConnect('deals')
  connect.on({
    data: async (dealData: TextDealModel, stock: string, date: string): Promise<any> => {
      const tableName = 'stock_' + stock
      await mysql.create(tableName, deals_ddl)
      let start = await mysql.count(tableName)
      if (dealData.dt === 1) {
        // {
        //   "code": "000001",
        //   "market": 0,
        //   "decimal": 2,
        //   "prePrice": 12.03,
        //   "details": [
        //     "09:15:00,12.09,9,0,4",
        //     "09:15:09,11.85,6034,0,4",
        //     "09:15:18,11.85,6154,0,4"
        //   ]
        // }
        const dealData1 = dealData as TextDealModelFromStream
        const details = createFields(dealData1).details || []
        for (let j = start; j < details.length; j++) {
          const [time, price, volumn, none, dealType] = details[j].split(',')
          const record: SQLDealModel = {} as SQLDealModel
          record.price = Number(price)
          record.date = sqlTime(date)
          record.time = sqlTime(time)
          record.volumn = Number(volumn) * 100
          record.deal_type = Number(dealType)
          record.data_type = dealData1.dt || 0
          record.market = dealData1.market
          record.highest_price = dealData1.hp
          record.lowest_price = dealData1.dp
          record.end_price = dealData1.ep
          mysql.insert(tableName, record)
        }
      } else {
        // c: '000001',
        // m: 0,
        // n: '平安银行',
        // ct: 0,
        // cp: 13050,
        // tc: 3890,
        // data: [
        //   { t: 91500, p: 13040, v: 1, bs: 4 },
        // ],
        // "hp": 13940, // 当日最高价
        // "dp": 13140, // 当日最低价
        // "ep": 13410 // 当日收盘价
        const dealData0 = dealData as TextDealModelFromJson
        const data = dealData0.data || []
        for (let i = start; i < data.length; i++) {
          const {t: time, p: price, v: volumn, bs: dealType} = data[i]
          const record: SQLDealModel = {} as SQLDealModel
          record.date = sqlTime(date)
          record.price = price / 1000
          record.time = int2time(time)
          record.volumn = volumn * 100
          record.deal_type = dealType
          record.data_type = dealData0.dt || 0
          record.market = dealData0.m
          record.highest_price = dealData0.hp / 1000
          record.lowest_price = dealData0.dp / 1000
          record.end_price = dealData0.ep / 1000
          mysql.insert(tableName, record)
        }
      }
    },
    end: mysql.finish
  })
  connect.emit()
})

// 拼装一些可简单计算的数据，以便调用，不用再通过浏览器爬取
function createFields (data: TextDealModelFromStream): TextDealModelFromStream {
  let hp = 0 // 当日最高价
  let ep = 0 // 当日收盘价
  let dp = 9999999 // 当日最低价
  data.details && data.details.forEach((deal) => {
    const [time, price, volumn, none, dealType] = deal.split(',')
    const priceNumber: number = Number(price)
    if (priceNumber > hp) hp = priceNumber
    if (priceNumber < dp) dp = priceNumber
    ep = priceNumber
  })
  data.dt = 1 // deals的数据结构分 0 1 两种
  data.hp = hp
  data.dp = dp
  data.ep = ep
  return data
}

function int2time (src: number): string {
  const timestr = (src + '').length === 5 ? '0' + src : '' + src
  const time = timestr.replace(/\d{2}/g, (dd, i) => (i !== 4) ? dd + ':' : dd)
  return sqlTime(time)
}

function sqlTime (time: string): string {
  return `'${time}'`
}