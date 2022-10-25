import Mysql from '@/db-utils/mysql/index'
import { Browser } from 'puppeteer'
import { UrlModel } from '@/types/stock'
import { Util } from '@/types/util.d'
declare global {
  var Mysql: typeof Mysql
  var $env: string
  var $module: string

  var $utils: Util
  var $urlModel: UrlModel
  var $browser: Browser

  var $sleepTimes: number
  var $bunchLimit: number
  var $questTimeout: number
  var $finalDealDate: string
  var $onBusyNetwork: boolean
  var $blackName: RegExp

  var $vline: Object<{
    time_dvd: number, // v型k线的形成时间
    price_range: number, // v型k线的深度
    haevy_standard: number // 大单的标准
  }>

  var $kline: Object<{
    page_size: number
  }>

  var $crossEnv: Object<{
    module: string
    netstat: string
  }>

  var $path: TreeObject<{
    src: string
    root: string
    utils: string
    db_utils: string
    db: TreeObject<{
      api: string
      dict: string
      home: string
      stocks: string
      base_data: string
    }>
  }>
}

export {}
