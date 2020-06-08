/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:26
 */
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const buildModel = require('./build-model')
const { readFileAsync, writeFileAsync } = require(`${global.srcRoot}/utils`)
module.exports = function buildStocksModel() {
  return new Promise(async (s, j) => {
    const alreadyData = await tryToloadAlreadyData(global.baseDataFile)
    if (alreadyData) return s(alreadyData)
    try {
      const browser = await puppeteer.launch().catch()
      const page = await browser.newPage().catch()
      const allStocks = await buildModel(page)
      const baseData = {
        date: new Date().getTime(),
        data: JSON.stringify(allStocks)
      }
      writeFileAsync(global.baseDataFile, baseData)
      return s(baseData)
    } catch (error) {
      console.error('build model error:', error)
      return j(error)
    }
  }).catch(function(error) {
    console.error('build model error:', error)
  })
}

function goToken(url) {
  try {
    if (!global.external.token) {
      var matchs = url.match(/[\?|\&]token\=[\d\w]+/ig)
      if (matchs.length) {
        global.external.token = matchs[0].split('=')[1]
      }
    }
  } catch (error) {
    console.log('./src/app/process/phantomjs/sniff_home_page.js:87 ', error)
    // phantom.exit()
  }
}

function tryToloadAlreadyData(filePath) {
  let data = readFileAsync(filePath, 'utf8')
  if (!data) return ''
  if (Number.parseInt(data.date) - new Date().getTime() >= 24 * 60 * 60 * 1000) {
    return ''
  } else {
    return data.data
  }
}
