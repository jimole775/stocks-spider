import { Page, Request, Response } from 'puppeteer'
import { Bunch } from './bunch'
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
  bunch: Bunch
  pages: BrowserPage[]
  urls: string[]
  requestCallback: BunchLinkingRequestEvent
  responseCallback: BunchLinkingResponseEvent
  end: Function

  constructor (urls: string[] = [], limit?: number) {
    this.pages = []
    this.urls = urls
    this.limitBunch = this._evalLimit(limit)
    this.bunch = new Bunch(this.limitBunch)
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

  _evalLimit (limit?: number): number {
    let res = limit || global.$bunchLimit
    if (this.urls && this.urls.length < res) {
      res = this.urls.length
    }
    return res
  }

  _consumeUrls (): Promise<void> {
    const loop = (urls: string[], resolve: Function) => {
      this.bunch.register(urls, this._taskEntity.bind(this))
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

  _isIdl (page: BrowserPage) {
    return page.idl === true
  }

  _isBusying (page: BrowserPage) {
    return page.busying === true
  }

  _setPageBusying (page: BrowserPage) {
    global.$log('page open:', page.id, page.url())
    page.idl = false
    page.busying = true
  }

  _setPageIdl (page: BrowserPage) {
    global.$log('page end:', page.id, page.url())
    page.idl = true
    page.busying = false
  }

  async _waitingComsumesFinished () {
    const condition = function (this: BunchLinking) {
      console.log(this.bunch.isDone, this.pages.map(i => i.busying))
      return this.bunch.isDone && !this.pages.find(i => i.busying)
    }
    await waitBy(condition.bind(this))
    return Promise.resolve()
  }

  _taskEntity (url: string): Promise<void> {
    return new Promise(async (resolve) => {
      const idlPage: BrowserPage = await this._pickIdlPage()
      if (idlPage.goto) {
        await idlPage.goto(url, { timeout: global.$questTimeout }).catch((err: string) => {
          // todo 报错的用log存起来, 并且记录page使用的情况，哪几个使用的频率高，然后分析内存使用状况
          console.log('bunch link failure:', url)
          this._setPageIdl(idlPage)
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
      for (let i = 0; i < this.limitBunch; i++) {
        const page: BrowserPage = await global.$browser.newPage() as BrowserPage
        await page.setRequestInterception(true)
        page.on('request', async (interceptedRequest: Request) => {
          if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
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
              // todo 这里没有顺利设置到page状态
              console.log('page end: ', page.id)
              this._setPageIdl(page)
            }
          })
        }
        this._setPageId(page, i)
        this._setPageIdl(page)
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
      this.pages.length = 0
      return resolve()
    })
  }

  async _pickIdlPage (): Promise<BrowserPage> {
    const condition = () => {
      const idlPage = this.pages.find(i => i.idl) as BrowserPage
      if (idlPage) this._setPageBusying(idlPage) // 因为当前处于并发状态，所以获取闲置页之后，需要马上转换页面状态
      return idlPage
    }
    const idlPage = await waitBy(condition)
    return Promise.resolve(idlPage)
  }

}
