const puppeteer = require('puppeteer')
const { isCSSUrl, isImgUrl } = require('./assert')
/**
 * 打开一个目标页面，然后探测所有请求
 * @param { Function } requestCallback 请求时的回调
 * @param { Function } responseCallback 响应时的回调
 * @return { Promise[browser.Page] }
 */
export function initPage(requestCallback: Function, responseCallback: Function): any {
  return new Promise(async (resolve, reject) => {
    return loop(requestCallback, responseCallback, resolve, reject)
  })
}

async function loop (requestCallback: Function, responseCallback: Function, resolve: Function, reject: Function) {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    page.on('request', (interceptedRequest: { url: () => string; abort: () => void; continue: () => void }) => {
      if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
        interceptedRequest.abort()
      } else {
        interceptedRequest.continue()
      }
      requestCallback && requestCallback(interceptedRequest)
    })
    if (responseCallback) {
      page.on('response', (response: any) => {
        responseCallback(response)
      })
    }
    return resolve(page)
  } catch (error) {
    console.log(error)
    return setTimeout(() => { loop(requestCallback, responseCallback, resolve, reject) }, 15)
  }
}
