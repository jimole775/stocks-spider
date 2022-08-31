const BunchThread = require('./bunch_thread.if')
const StockConnect = require('../utils/stock_connect')
export default interface StockConnectInterface {
  bunch: typeof BunchThread
  targetDir: string
  ignoreCodes: string[]
  ignoreDates: string[]
  stockCodes: string[]

  dataEventReceiver: () => typeof StockConnect
  endEventReceiver: () => typeof StockConnect
  on: (option: object, callback: Function) => typeof StockConnect
  emit: () => typeof StockConnect
}
