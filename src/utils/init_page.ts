
import puppeteer, { Request, Response } from 'puppeteer'
import { isCSSUrl, isImgUrl } from './assert'
import { Page } from '@/types/common'
export type RequestCallback = (option: Request) => Promise<void> | void
export type ResponseCallback = (option: Response) => Promise<void> | void
/**
 * 打开一个目标页面，然后探测所有请求
 * @param { Function } requestCallback 请求时的回调
 * @param { Function } responseCallback 响应时的回调
 * @return { Promise[browser.Page] }
 */
export function initPage(requestCallback?: RequestCallback, responseCallback?: ResponseCallback): Promise<Page> {
  return new Promise(async (resolve, reject) => {
    return loop(resolve, reject, requestCallback, responseCallback)
  })
}

async function loop (
  resolve: Function, reject: Function,
  requestCallback?: RequestCallback,
  responseCallback?: ResponseCallback
): Promise<any> {
  try {
    const browser = await puppeteer.launch()
    const page: Page = await browser.newPage()
    await page.setRequestInterception(true)
    // todo 这里需要判断callback是否返回了正确的结果
    page.on('request', async (interceptedRequest: Request) => {
      if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
        interceptedRequest.abort()
      } else {
        interceptedRequest.continue()
      }
      if (requestCallback) {
        requestCallback(interceptedRequest)
      }
    })
    if (responseCallback) {
      page.on('response', (response: Response) => {
        responseCallback(response)
      })
    }
    return resolve(page)
  } catch (error) {
    console.log(error)
    return setTimeout(() => { loop(resolve, reject, requestCallback, responseCallback) }, 15)
  }
}
