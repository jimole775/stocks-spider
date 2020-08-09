/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:26
 */
const puppeteer = require('puppeteer')
const buildModel = require('./build-model')
const { readFileSync, writeFileSync } = require(global.utils)
module.exports = function buildStocksModel() {
  return new Promise(excutes)
}

async function excutes (resolve, reject) {
  let alreadyData = readFileSync(filePath, 'utf8')
  if (new Date().getTime() - new Date(alreadyData.date).getTime() <= 24 * 60 * 60 * 1000) {
    return resolve()
  }
  try {
    const browser = await puppeteer.launch().catch()
    const pageEnity = await browser.newPage().catch()
    const allStocks = await buildModel(pageEnity)
    const baseData = {
      date: new Date().getTime(),
      data: alreadyData ? merge(alreadyData.data, allStocks) : JSON.stringify(allStocks)
    }
    writeFileSync(global.baseData, baseData)
    return resolve(baseData)
  } catch (error) {
    console.error('build model error:', error)
    return reject(error)
  }
}

function merge (alreadyData, newItems) {
  const res = []
  alreadyData.forEach((oldItem) => {
    for (let j = 0; j < newItems.length; j++) {
      const newItem = newItems[j]
      if (element.code === oldItem.code) {
        res.push({
          ...oldItem,
          name: newItem.name
        })
        newItems.splice(j, 1)
        break
      }
    }
  })
  return res
}
