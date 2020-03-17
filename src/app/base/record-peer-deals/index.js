/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
import path from 'path'
const { readFile, writeFile, batchLink, quest } = require(`${global.srcRoot}/utils`)
const recordPath = `${global.srcRoot}/db/warehouse/peer-deals/`
const baseData = readFile(`${global.srcRoot}/db/warehouse/base.json`)
const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
const allStocks = JSON.parse(baseData ? baseData.data : {})
export async function recordPeerDeals() {
  const urls = allStocks.map(item => {
    return urlModel.model.PeerDeal
    .replace('[stockCode]', item.code)
    .replace('[marketCode]', item.marketCode)
  })
  batchLink(urls, {
    // onLinked: analyzeContent,
    onResponse: response => {
      if (response.status() === 200 && peerDealReg.test(response.url())) {
        doRecord(response)
      }
    }
  })
}

async function analyzeContent(page) {
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  const homeUrl = page._frameManager._mainFrame._navigationURL || ''
  const stockCode = homeUrl.replace(/^http.*?\?code\=(\d*?)&.+?$/ig, '$1')
  const file = path.join(recordPath, stockCode + '.html')
  const alreadyData = await readFile(file)
  if (alreadyData && alreadyData.date - new Date().getTime() < 24 * 60 * 60 * 1000) {
    return alreadyData.data
  }
  const content = await page.content()
  writeFile(file, content)
}

async function doRecord(response) {
  // 修改数据的请求数量?pagesize=144&
  const url = response.url().replace(/^(http.*?)\?pagesize\=\d*?\&(.*?)$/, '$1?pagesize=99999&$2')
  const dirtyData = await quest(url)
  const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
  const stockCode = pureData.data.c
  const stockName = pureData.data.n
  const dateObj = new Date()
  const curYear = dateObj.getFullYear()
  const curMon = dateObj.getMonth() + 1
  const curDate = dateObj.getDate()
  const curDay = dateObj.getDay()
  let datePath = `${curYear}-${curMon}-${curDate}`
  if (curDay == 6) { 
    // 星期6
    var friday = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000 * 1)
    datePath = `${friday.getFullYear()}-${friday.getMonth() + 1}-${friday.getDate()}`
  }
  if (curDay == 0) { 
    // 星期天
    var friday = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000 * 2)
    datePath = `${friday.getFullYear()}-${friday.getMonth() + 1}-${friday.getDate()}`
  }
  writeFile(path.join(recordPath, datePath, `${stockCode}.json`), pureData.data.data)
}