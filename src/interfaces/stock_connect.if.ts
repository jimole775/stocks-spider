const BunchThread = require('./bunch_thread.if')
const StockConnect = require('../utils/stock_connect')
export type DataEventReceiver = (dealData: string[], stock: string, date: string) => Promise<any>
export type EndEventReceiver = () => Promise<any>
export type OnEvent = (option:{ data: DataEventReceiver, end: EndEventReceiver }, callback: Function) => typeof StockConnect
export type EmitEvent = () => Promise<any>
export type EventOption = { data?: DataEventReceiver, end?: EndEventReceiver }
export interface StockConnectInterface {
  emit: EmitEvent
  on: OnEvent
  bunch: typeof BunchThread
  targetDir: string
  ignoreCodes: string[]
  ignoreDates: string[]
  stockCodes: string[]
  endEventReceiver: EndEventReceiver
  dataEventReceiver: DataEventReceiver
}
