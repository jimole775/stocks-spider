require(`../../../global.config.js`)().then(async () => {
  const Mysql = require(`${global.db_utils}/mysql/index.js`)
  const db_config = require(`${global.root}/db_config.json`)
  const deals_ddl = require(`${global.root}/src/db-utils/mysql/ddl/deals.json`)
  const { StockConnect } = require(`${global.utils}`)
  const mysql = new Mysql(db_config.deals)
  const connect = new StockConnect('deals')
  connect.on('data', (dealData, stock, date)=> {
    const tableName = 'stock_' + stock
    await mysql.create(tableName, deals_ddl)
    if (dealData.dt === 1) {
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
      const data = dealData.data || []
      data.forEach((deal) => {
        const {t: time, p: price, v: volumn, bs: dealType} = deal
        const record = {}
        record.price = price / 1000
        record.time = int2time(time)
        record.volumn = volumn * 100
        record.deal_type = dealType
        record.data_type = dealData.dt || 0
        record.market = dealData.m
        record.highest_price = dealData.hp / 1000
        record.lowest_price = dealData.dp / 1000
        record.end_price = dealData.ep / 1000
        mysql.insert(tableName, record)
      })
    } else {
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
      const details = createFields(dealData).details || []
      details.forEach((deal) => {
        const [time, price, volumn, none, dealType] = deal.split(',')
        const record = {}
        record.price = price
        record.time = time
        record.volumn = volumn * 100
        record.deal_type = dealType
        record.data_type = dealData.dt || 0
        record.market = dealData.market
        record.highest_price = dealData.hp
        record.lowest_price = dealData.dp
        record.end_price = dealData.ep
        mysql.insert(tableName, record)
      })
    }
    mysql.disconnect()
  })
  connect.emit()
})

// todo 2022/08/01 的数据，没有运行次方法
// 拼装一些可简单计算的数据，以便调用，不用再通过浏览器爬取
function createFields (data = {}) {
  let hp = 0 // 当日最高价
  let ep = 0 // 当日收盘价
  let dp = 9999999 // 当日最低价
  data.details && data.details.forEach((deal) => {
    let [time, price, volumn, none, dealType] = deal.split(',')
    if (price > hp) hp = price
    if (price < dp) dp = price
    ep = price
  })
  data.dt = 1 // deals的数据结构分 0 1 两种
  data.hp = hp
  data.dp = dp
  data.ep = ep
  return data
}

function int2time (src) {
  src = src.length === 5 ? '0' + src : '' + src
  return src.replace(/\d{2}/g, (dd, i) => (i !== 4) ? dd + ':' : dd)
}