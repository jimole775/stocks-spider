import BunchLinking from '../utils/bunch_linking'
import BunchThread from '../utils/bunch_thread'
import StockConnect from '../utils/stock_connect'
import Link from '../utils/link'
import { RequestCallback, ResponseCallback } from '../utils/init_page'
import { StringObject, StockResponse } from './common.d'

export type Util = {
  Link: Link
  BunchLinking: BunchLinking
  BunchThread: BunchThread
  StockConnect: StockConnect
  assert: {[key: string]: Function<boolean>}
  buildPath: (asbFilePath: string) => string
  cmdParam: (getKey?: string) => StringObject | string
  diffrence: (src: any, eliminateItems: any) => any | null
  getPathSeparator: (path: string) => string
  hasRefreshLinks: (links: string[], recordDir: string[]) => string[]
  hasUnlinked: (dataPath: string, chart: string) => string[]
  initPage: (requestCallback?: RequestCallback, responseCallback?: ResponseCallback) => Promise<Page>
  quest: (url: string, params: { header?: StringObject }) => Promise<StockResponse>
  readDirSync: (dir: fs.PathLike) => string[]
  readFileSync: (filePath: string) => any
  recordUsedApi: (apiKey: string, apiMap: StringObject) => Promise<void>
  removeDir: (asbFilePath: string) => Promise<any>
  removeFile: (asbFilePath: string) => Promise<any>
  removeSiblingDir: (asbFilePath: string) => void
  requestApiInBunch: (apikey: string, apis: string[], task: Function) => Promise<string[]>
  sleep: (time = 1000) => Promise<void>
  toMoney: (number: number|string, decimals: number = 2, decPoint: string, thousandsSep: string) => string
  unique: <T>(arrays: T[]) => T[]
  writeFileSync: (asbFilePath: string, data: any) => void
}