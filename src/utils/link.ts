import { Page, Request, Response } from 'puppeteer'
import { isCSSUrl, isImgUrl } from './assert'


export type RequestCallback = (option: Request) => Promise<boolean | void>
export type ResponseCallback = (option: Response) => Promise<boolean | void> 
export interface LinkInterface {

}
/**
 * 单线程
 */
export class Link implements LinkInterface {
  url: string
  page: Page
  request: RequestCallback
  response: ResponseCallback
  end: Function
  constructor (url: string) {
    this.url = url
    this.page = {} as Page
    this.request = () => Promise.resolve()
    this.response = () => Promise.resolve()
    this.end = () => {}
  }

  on (option: { request?: RequestCallback, response?: ResponseCallback, end?: Function }) {
    if (option.request) this.request = option.request
    if (option.response) this.response = option.response
    if (option.end) this.end = option.end
    return this
  }

  async emit () {
    this.page = await global.$browser.newPage()
    await this.page.setRequestInterception(true)
    this.page.on('request', async (interceptedRequest: Request) => {
      if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
        interceptedRequest.abort()
      } else {
        interceptedRequest.continue()
      }
      if (this.request) {
        this.request(interceptedRequest)
      }
    })
    if (this.response) {
      this.page.on('response', async (response: Response) => {
        const hasDone = await this.response(response)
        if (hasDone) {
          // do something
        }
      })
    }
    return new Promise((resolve: Function, reject: Function) => {
      return this.emitHandler(this.url, resolve, reject)
    })
  }

  async emitHandler (url: string, resolve: Function, reject: Function): Promise<void> {
    try {
      await this.page.goto(url, { timeout: 0 })
      await this.shutdownPage()
      return resolve()
    } catch (error) {
      console.log(error)
      return this.emitHandler (url, resolve, reject)
    }
  }

  shutdownPage () {
    return new Promise((resolve, reject) => {
     return this.shutdownHandler(resolve, reject)
    })
  }

  async shutdownHandler (resolve: Function, reject: Function): Promise<any> {
    try {
      return resolve(await this.page.close())
    } catch (error) {
      return setTimeout(() => this.shutdownHandler(resolve, reject), 15)
    }
  }
}
