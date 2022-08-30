import MysqlInterface from '../interfaces/Mysql.if'
declare global {
  var Mysql: MysqlInterface
  var $env: string
  var $module: string

  var $utils: Object
  var $urlModel: Object

  var $sleepTimes: number
  var $bunchLimit: number
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

  var $path: Object<{
    src: string
    root: string
    utils: string
    db_utils: string
    db: Object<{
      api: string
      dict: string
      home: string
      stocks: string
      base_data: string
    }>
  }>
}

export {}