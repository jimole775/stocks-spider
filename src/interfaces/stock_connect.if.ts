import BunchThread from '../utils/bunch_thread'
import StockConnect from '../utils/stock_connect'
import { TextDealModel } from '../types/stock'
export type DataEventReceiver = (dealData: TextDealModel, stock: string, date: string) => Promise<any>
export type EndEventReceiver = () => Promise<any>
export type OnEvent = (option:{ data: DataEventReceiver, end: EndEventReceiver }, callback: Function) => StockConnect
export type EmitEvent = () => Promise<any>
export type EventOption = { data?: DataEventReceiver, end?: EndEventReceiver }
export interface StockConnectInterface {
  emit: EmitEvent
  on: OnEvent
  bunch: BunchThread
  targetDir: string
  ignoreCodes: string[]
  ignoreDates: string[]
  stockCodes: string[]
  endEventReceiver: EndEventReceiver
  dataEventReceiver: DataEventReceiver
}
