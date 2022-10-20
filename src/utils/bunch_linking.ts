import { Page, Request, Response } from 'puppeteer'
import { BunchThread } from './bunch_thread'
import { isCSSUrl, isImgUrl } from './assert'
import { waitBy } from './wait_by'
const LogTag = 'utils.BunchLinking => '

export interface BrowserPage extends Page {
  id: string,
  idl: boolean,
  busying: boolean,
}

export type BunchLinkingResponse = Response

export type BunchLinkingRequest = Request

export type BunchLinkingResponseEvent = (e: Response, ...args: any[]) => Promise<boolean | void>

export type BunchLinkingRequestEvent = (e: Request, ...args: any[]) => Promise<boolean | void>

/**
 * 并发请求，html类型
 * 主要是访问一个主页，然后从页面上探测所有接口
 */
export class BunchLinking {
  limitBunch: number
  bunchThread: BunchThread
  pages: BrowserPage[]
  urls: string[]
  requestCallback: BunchLinkingRequestEvent
  responseCallback: BunchLinkingResponseEvent
  end: Function
  constructor (urls: string[] = [], limit: number = global.$bunchLimit) {
    this.pages = []
    this.urls = urls
    this.limitBunch = limit
    this.bunchThread = new BunchThread(limit)
    this.requestCallback = () => Promise.resolve()
    this.responseCallback = () => Promise.resolve()
    this.end = () => { return [] }
    return this
  }

  on (option: { request?: BunchLinkingRequestEvent, response?: BunchLinkingResponseEvent, end?: Function }) {
    if (option.request) this.requestCallback = option.request
    if (option.response) this.responseCallback = option.response
    if (option.end) this.end = option.end
    return this
  }

  async emit () {
    await this._buildPages()
    await this._consumeUrls()
    return Promise.resolve()
  }

  _consumeUrls (): Promise<void> {
    const loop = (urls: string[], resolve: Function) => {
      this.bunchThread.register(urls, async (url: string): Promise<void> => {
        await this._taskEntity(url)
        return Promise.resolve()
      })
      .finally(async () => {
        await this._waitingComsumesFinished()
        const remainUrls = await this.end()
        if (remainUrls && remainUrls.length) {
          console.log(LogTag, 'remainUrls: ', remainUrls.length)
          return loop(remainUrls, resolve)
        } else {
          console.log(LogTag, 'loop end, shutting down pages!')
          await this._shutdownPages()
          return resolve()
        }
      })
      .emit()
    }

    return new Promise((resolve) => {
      return loop(this.urls, resolve)
    })
  }

  _setPageId (page: BrowserPage, i: number) {
    page.id = '_id_' + i
  }

  _setPageWorking (page: BrowserPage) {
    page.idl = false
    page.busying = true
  }

  _setPageLiedown (page: BrowserPage) {
    page.idl = true
    page.busying = false
  }

  async _waitingComsumesFinished () {
    await waitBy(() => this.bunchThread.isDone && !this.pages.find(i => i.busying))
    return Promise.resolve()
    // const loopEntity = async (loopResolve: Function): Promise<any> => {
    //   if (this.bunchThread.isDone && !this.pages.find(i => i.busying)) {
    //     return loopResolve()
    //   } else {
    //     return setTimeout(() => {
    //       return loopEntity(loopResolve)
    //     }, 500)
    //   }
    // }
    // return new Promise((resolve: Function) => {
    //   return loopEntity(resolve)
    // })
  }

  _taskEntity (url: string): Promise<void> {
    return new Promise(async (resolve) => {
      const idlPage: BrowserPage = await this._pickIdlPage()
      if (idlPage.goto) {
        await idlPage.goto(url, { timeout: 0 }).catch((err: string) => {
          console.log(LogTag, 'idlPage.goto err: ', err)
          return resolve()
        })
        return resolve()
      } else {
        return resolve()
      }
    })
  }

  _buildPages (): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i <= this.limitBunch; i++) {
        const page: BrowserPage = await global.$browser.newPage() as BrowserPage
        await page.setRequestInterception(true)
        page.on('request', async (interceptedRequest: Request) => {
          if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url()) || page.idl === true) {
            interceptedRequest.abort()
          } else {
            interceptedRequest.continue()
          }
          if (this.requestCallback) {
            this.requestCallback(interceptedRequest)
          }
        })
        if (this.responseCallback) {
          page.on('response', async (response: Response) => {
            const hasDone = await this.responseCallback(response)
            if (hasDone === true) {
              this._setPageLiedown(page)
            }
          })
        }
        this._setPageId(page, i)
        this._setPageLiedown(page)
        this.pages.push(page)
      }
      return resolve()
    })
  }

  _shutdownPages (): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < this.pages.length; i++) {
        const page: Page = this.pages[i]
        await page.close().catch(() => { i - 1 })
      }
      this.pages = []
      return resolve()
    })
  }

  async _pickIdlPage (): Promise<BrowserPage> {
    await waitBy(() => !!this.pages.find(i => i.idl))
    const idlPage: BrowserPage = this.pages.find(i => i.idl) as BrowserPage
    this._setPageWorking(idlPage) // 因为当前处于并发状态，所以获取闲置页之后，需要马上转换页面状态
    return Promise.resolve(idlPage)
    // const loopEntity = async (loopResolve: Function): Promise<any> => {
    //   const idlPage: BrowserPage = this.pages.find(i => i.idl) as BrowserPage
    //   console.log('_pickIdlPage: ', idlPage.id)
    //   if (idlPage) {
    //     this._setPageWorking(idlPage) // 因为当前处于并发状态，所以获取闲置页之后，需要马上转换页面状态
    //     return loopResolve(idlPage)
    //   } else {
    //     return setTimeout(() => {
    //       return loopEntity(loopResolve)
    //     }, 500)
    //   }
    // }
    // return new Promise((resolve: Function) => {
    //   return loopEntity(resolve)
    // })
  }

}
