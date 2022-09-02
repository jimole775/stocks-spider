import initPage, { RequestCallback, ResponseCallback } from './init_page'
import { Page } from "../types/common"

export interface LinkInterface {

}
/**
 * 单线程
 */
export default class Link implements LinkInterface {
  url: string
  page: Page
  request: RequestCallback
  response: ResponseCallback
  end: Function
  constructor (url: string) {
    this.url = url
    this.page = {} as Page
    this.request = () => {}
    this.response = () => {}
    this.end = () => {}
  }

  on (option: { request?: RequestCallback, response?: ResponseCallback, end?: Function }) {
    if (option.request) this.request = option.request
    if (option.response) this.response = option.response
    if (option.end) this.end = option.end
    return this
  }

  async emit () {
    this.page = await initPage(this.request, this.response)
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
