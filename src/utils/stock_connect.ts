import {
  StockConnectInterface,
  DataEventReceiver,
  EndEventReceiver,
  OnEvent,
  EmitEvent,
  EventOption
} from '@/interfaces/stock_connect.if'

export {
  StockConnectInterface,
  DataEventReceiver,
  EndEventReceiver,
  OnEvent,
  EmitEvent,
  EventOption
}

import { StringObject } from '@/types/common';
import BunchThread from './bunch_thread'
import path from 'path'
import readDirSync from './read_dir_sync'
import readFileSync from './read_file_sync'
import diffrence from './diffrence'
import * as assert from './assert'

const dict_code_name: StringObject = require(path.join(global.$path.db.dict, 'code-name.json'))
const dbPath:string = global.$path.db.stocks
const LogTag:string = 'utils.StockConnect => '

/**
 * 读取指定存储目录的stock
 * 当前仅支持目录结构 `${global.path.db.stocks}/${stock}/${targetDir}/${date}`
 */
export default class StockConnect implements StockConnectInterface {
  bunch: BunchThread = new BunchThread(1)
  targetDir: string = ''
  ignoreCodes: string[] = []
  ignoreDates: string[] = []
  stockCodes: string[] = []
  dataEventReceiver: DataEventReceiver = () => Promise.resolve()
  endEventReceiver: EndEventReceiver = () => Promise.resolve()
  on:OnEvent = on.bind(this)
  emit:EmitEvent = emit.bind(this)
  constructor (targetDir: string, ignoreObject?: { codes?: string[], dates?: string[] } ) {
    this.targetDir = targetDir
    if (ignoreObject) {
      this.ignoreCodes = ignoreObject.codes || []
      this.ignoreDates = ignoreObject.dates || []
    }
    this.stockCodes = readDirSync(dbPath)
    if (!this.stockCodes || this.stockCodes.length === 0) {
      // 项目刚建立，还没有创建表
      throw new Error(LogTag + 'stockCodes directory is not build!')
    }

    if (this.ignoreCodes && this.ignoreCodes.length) {
      this.stockCodes = diffrence(this.stockCodes, this.ignoreCodes)
    }
  }
}

function on (this: StockConnect, option: EventOption | string, callback?: Function): StockConnect {
  if (assert.isObject(option)) {
    if (option.hasOwnProperty('data')) {
      this.dataEventReceiver = (option as EventOption).data as DataEventReceiver
    }
    if (option.hasOwnProperty('end')) {
      this.endEventReceiver = (option as EventOption).end as EndEventReceiver
    }
  }
  if (assert.isString(option) && callback) {
    const eventType: string = option as string
    if (eventType === 'data') {
      this.dataEventReceiver = callback as DataEventReceiver
    }
    if (eventType === 'end') {
      this.endEventReceiver = callback as EndEventReceiver
    }
  }
  return this
}

async function emit (this: StockConnect): Promise<any> {
  for (let i = 0; i < this.stockCodes.length; i++) {
    const code:string = this.stockCodes[i]

    // 匹配黑名单
    if (global.$blackName.test(dict_code_name[code])) continue

    console.log(LogTag, code, dict_code_name[code])

    let dateFiles: string[] = readDirSync(path.join(dbPath, code, this.targetDir))

    if (this.ignoreDates) dateFiles = cuteIgnoreDates(dateFiles, this.ignoreDates)

    for (let j = 0; j < dateFiles.length; j++) {
      const dateFile:string = dateFiles[j]
      const fileData: any = readFileSync(path.join(dbPath, code, this.targetDir, dateFile))
      const params:[any, string, string] = [fileData, code, dateFile.split('.').shift() as string]
      await this.dataEventReceiver.apply(this, params)
    }
  }

  this.bunch.finally(() => {
    this.endEventReceiver && this.endEventReceiver()
  })
  return Promise.resolve()
}

function cuteIgnoreDates (dateFiles: string[], ignoreDates: string[]): string[] {
  const res:string[] = []
  const copyDates:string[] = ignoreDates.concat([])
  dateFiles.forEach((dateFile) => {
    res.push(dateFile)
    for (let index = 0; index < copyDates.length; index++) {
      const ignoreDate = copyDates[index]
      if (dateFile.includes(ignoreDate)) {
        res.pop()
        copyDates.splice(index, 1)
        break
      }
    }
  })
  return res
}
