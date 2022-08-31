const puppeteer = require('puppeteer')
const { isCSSUrl, isImgUrl } = require('./assert')
/**
 * 打开一个目标页面，然后探测所有请求
 * @param { Function } requestCallback 请求时的回调
 * @param { Function } responseCallback 响应时的回调
 * @return { Promise[browser.Page] }
 */
module.exports = function initPage(requestCallback, responseCallback) {
  return new Promise(async (s, j) => {
    return loop(requestCallback, responseCallback, s, j)
  })
}

async function loop (requestCallback, responseCallback, s, j) {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    page.on('request', interceptedRequest => {
      if ( isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
        interceptedRequest.abort()
      } else {
        interceptedRequest.continue()
      }
      requestCallback && requestCallback(interceptedRequest)
    })
    if (responseCallback) {
      page.on('response', response => {
        responseCallback(response)
      })
    }
    return s(page)
  } catch (error) {
    console.log(error)
    return setTimeout(() => { loop(requestCallback, responseCallback, s, j) }, 15)
  }
}
