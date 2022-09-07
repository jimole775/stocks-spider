import Mysql from '..'
import { TextKlineModel } from '@/types/stock'
require(`../../../global.config.js`)().then(() => {
  // const Mysql = require(`${global.db_utils}/mysql/index.js`)
  const db_config = require(`${global.$path.root}/db_config.json`)
  const ddl = require(`${global.$path.db_utils}/mysql/ddl/klines.json`)
  const { StockConnect } = global.$utils

  const mysql_klines = new global.Mysql(db_config.klines)
  const mysql_frKlines = new global.Mysql(db_config.fr_klines)
  const connect_klines = new StockConnect('klines')
  const connect_frKlines = new StockConnect('fr-klines')

  connect_klines.on({
    data: async (klineData: TextKlineModel, stock: string, date: string) => {
      await mysql_klines.create('daily_' + stock, ddl)
      dataHandler(mysql_klines, klineData, stock, date)
      return Promise.resolve()
    },
    end: ():Promise<any> => {
      return Promise.resolve()
    }
  })
  connect_frKlines.on({
    data: async (klineData: TextKlineModel, stock: string, date: string) => {
      await mysql_frKlines.create('daily_' + stock, ddl)
      dataHandler(mysql_frKlines, klineData, stock, date)
      return Promise.resolve()
    },
    end: ():Promise<any> => {
      return Promise.resolve()
    }
  })

  connect_klines.emit()
  connect_frKlines.emit()
})

function dataHandler (mysql: Mysql, klineData: TextKlineModel, stock: string, date: string) {
  // "code": "000001",
  // "market": 0,
  // "name": "paxh",
  // "decimal": 2,
  // "dktotal": 7438,
  // "klines": [
  //   "2021-12-02,17.62,17.59,17.81,17.37,994798,1749164560.00,2.49",
  //   "2021-12-03,17.64,17.65,17.70,17.41,707600,1242375056.00,1.65",
  //   "2021-12-06,17.85,18.10,18.56,17.80,2145625,3896385168.00,4.31"
  // ]
  const klines = klineData.klines || []
  const market = klineData.market
  klines.forEach((kline) => {
    // * "日期，开盘价，收盘价，最高价，最低价，量，价，振幅"
    const [ date, start_price, end_price, highest_price, lowest_price, volumn, amount, divid_rate ] = kline.split(',')
    const record = { date, start_price, end_price, highest_price, lowest_price, volumn: Number(volumn) * 100, amount, divid_rate, market }
    // mysql.insert(tableName, record)
  })
  // mysql.finish()
}