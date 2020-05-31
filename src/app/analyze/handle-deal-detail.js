/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:14 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-14 11:36:57
 */

/**
 * 筛选优质股逻辑
 * ~1. 60%的交易日振幅超过3%，换手率超过1%~
 * ~2. 负债不超过42，净利率不能为负, 当前市盈率不超过150，不低于15, 股价不低于3元~
 * 3. 名字不带 "ST" "退市" "银行" "钢"
 * ~4. 交易日总数 超过 半年（366/7*5/2 - [节假日:国庆3 + 劳动3 + 清明3 + 中秋3 + 春节3]）~
 * ~5. 屏蔽板块 - 房地产，医药，生物，汽车~
 */

/**
 * 筛选近期强势股逻辑
 * 1. 最近几个季度（月度），平均换手率和振幅有梯级上升的（股价伴随上升）
 * 1. 本季度和上个季度，高低股价价差不超过30%的
 * 2. 连日来，主力资金净流入
 */

/**
 * 执行逻辑
 * 从 http://guba.eastmoney.com/remenba.aspx?type=1 拉取所有股票的列表
 * 使用 http://quote.eastmoney.com/sh[stockCode].html 模型来拼接每个股票的主页
 * 监听页面的接口信息
 * 过滤出一条 带有 "EM_UBG_PDTI_Fast" 字段的请求url
 * 使用http来访问url 
 */
const superagent = require('superagent')
const fs = require('fs')

module.exports = function handleDealDetail(url) {
  return quest(url)
    .then(function ({ data = [], code, name }) {
      // 拿到每日交易概况，从里面分析出个股的股性
      const columnConstructor = parser(data)
      console.log('质量检测中...', name, code)
      if (isBeyandHalfYear(columnConstructor['date']) &&
        queryByTurnOver(columnConstructor['turnover']) &&
        queryByAmplitude(columnConstructor['amplitude'])) {
        console.log('高质通过：', name, code)
        hqList[code] = {
          name: name,
          code: code,
          allDealUrl: url
        }
        fs.writeFileSync('./src/db/base_hq.json', JSON.stringify(hqList), 'utf8')
      } else {
        console.log('高质失败：', name, code)
        dishqList[code] = {
          name: name,
          code: code,
          allDealUrl: url
        }
        fs.writeFileSync('./src/db/base_dishq.json', JSON.stringify(dishqList), 'utf8')
      }
    }).catch(function (e) {
      console.log(__dirname + ':', e)
    })
}

function quest(url) {
  return new Promise((s, j) => {
    const ip = Math.random(1, 254)
      + "." + Math.random(1, 254)
      + "." + Math.random(1, 254)
      + "." + Math.random(1, 254)
    superagent.get(url).set('X-Forwarded-For', ip).end((err, { text = '' }) => {
      err && j(err)
      const dataString = text.match(/\(\{.+\}\)/ig)[0]
      const data = dataString && eval(dataString)
      s(data)
    })
  })
}

function parser(list) {
  const enumMap = {
    0: 'date', // '日期'
    1: 'startPrice', // '开盘价'
    2: 'endPrice', // '收盘价'
    3: 'topPrice', // '最高价'
    4: 'bottomPrice', // '最低价'
    5: 'dealCount', // '交易量(手)'
    6: 'dealSum', // '交易额(元)'
    7: 'amplitude', // '振幅'
    8: 'turnover', // '换手率'
  }
  const result = {}
  // [2017-03-28,0.941,0.933,0.941,0.928,2499,232748,1.39%,0.14]
  // ['日期','开盘价','收盘价','最高价','最低价','交易量(手)','交易额(元)','振幅','换手率']
  let loop = list.length
  while (loop--) {
    const dayItem = list[loop].split(',')
    dayItem.forEach((element, index) => {
      if (!result[enumMap[index]]) result[enumMap[index]] = []
      result[enumMap[index]].push(element)
    })
  }
  return result
}

/**
 * 60%的交易日换手率超过1%
 */
function queryByTurnOver(list = []) {
  let loop = list.length
  let baseRate = 1
  let beyandTimes = 0
  while (loop--) {
    const trunoverRate = Number.parseFloat(list[loop])
    if (trunoverRate >= baseRate) beyandTimes++
  }
  return beyandTimes / list.length >= 0.6
}

/**
 * 交易日总数 超过 半年（366/7*5/2 - [节假日:国庆3 + 劳动3 + 清明3 + 中秋3 + 春节3]）
 */
function isBeyandHalfYear(list = []) {
  return list.length >= 366 / 7 * 5 / 2 - (3 + 3 + 3 + 3 + 3)
}

/**
 * 60%的交易日振幅超过3%
 */
function queryByAmplitude(list = []) {
  let loop = list.length
  let baseRate = 3
  let beyandTimes = 0
  while (loop--) {
    const trunoverRate = Number.parseFloat(list[loop])
    if (trunoverRate >= baseRate) beyandTimes++
  }
  return beyandTimes / list.length >= 0.6
}

module.exports = exc