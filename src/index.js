require('@babel/register') // 转接外部模块的加载方式，amd改为common
require('./global.config')

const { spillStockModel } = require ('./app/base/spill-stock-model')
const { stockHomePage } = require ('./app/base/stock-home-page')
const { recordPeerDeals } = require ('./app/base/record-peer-deals')
const { webHome } = require ('./app/base/web-home')
;(async function (){
  // await spillStockModel()
  // stockHomePage()
  // recordPeerDeals()
  webHome()
})()
