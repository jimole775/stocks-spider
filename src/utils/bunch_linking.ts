import { Page, Request, Response } from 'puppeteer'
import { BunchThread } from './bunch_thread'
import { isCSSUrl, isImgUrl } from './assert'
const LogTag = 'utils.BunchLinking => '

export interface BrowserPage extends Page {
  idl: boolean,
  id: string,
  abort: boolean
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
  bunch: BunchThread
  pages: BrowserPage[]
  urls: string[]
  requestCallback: BunchLinkingRequestEvent
  responseCallback: BunchLinkingResponseEvent
  end: Function
  constructor (urls: string[] = [], limit: number = global.$bunchLimit) {
    this.limitBunch = limit
    this.urls = urls
    this.bunch = new BunchThread(limit)
    this.pages = []
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
    return new Promise((resolve, reject) => {
      return this._consumeUrls(this.urls, resolve, reject)
    })
  }

  _consumeUrls (urls: string[], resolve: Function, reject: Function) {
    this.bunch.register(urls, async (url: string): Promise<void> => {
      await this._taskEntity(url)
      return Promise.resolve()
    })
    .finally(async () => {
      let remainUrls = this.end()
      if (remainUrls && remainUrls.length) {
        console.log(LogTag, 'remainUrls: ', remainUrls.length)
        return this._consumeUrls(remainUrls, resolve, reject)
      } else {
        console.log(LogTag, 'loop end, shutting down pages!')
        await this._shutdownPages()
        return resolve()
      }
    })
    .emit()
  }

  _taskEntity (url: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const idlPage: BrowserPage = this._pickIdlPage()
      if (idlPage.goto) {
        idlPage.idl = false
        await idlPage.goto(url, { timeout: 0 }).catch((err: string) => {
          console.log(LogTag, 'idlPage.goto:', err)
          return reject()
        })
        // todo 需要根据idlPage的数量来判断要waiting时间
        await this._waitingPageAborted(idlPage)
        idlPage.idl = true
        return resolve()
      } else {
        return reject()
      }
    })
  }

  _waitingPageAborted (tar: BrowserPage) {
    return new Promise((resolve: Function) => {
      loop(tar, resolve)
    })
    function loop (tar: BrowserPage, end: Function) {
      if (tar.abort === true) {
        return end()
      } else {
        setTimeout(() => {
          return loop(tar, end)
        }, 15)
      }
    }
  }

  _buildPages (): Promise<void> {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.limitBunch; i++) {
        const idlPage: BrowserPage = await global.$browser.newPage() as BrowserPage
        await idlPage.setRequestInterception(true)
        idlPage.on('request', async (interceptedRequest: Request) => {
          if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url()) || idlPage.abort === true) {
            interceptedRequest.abort()
          } else {
            interceptedRequest.continue()
          }
          if (this.requestCallback) {
            this.requestCallback(interceptedRequest)
          }
        })
        if (this.responseCallback) {
          idlPage.on('response', async (response: Response) => {
            const hasDone = await this.responseCallback(response)
            if (hasDone === true) {
              idlPage.abort = true
            }
          })
        }
        idlPage.id = '_id_' + i
        idlPage.idl = true
        idlPage.abort = false
        this.pages.push(idlPage)
      }
      return resolve()
    })
  }

  _shutdownPages (): Promise<void> {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.pages.length; i++) {
        const page: Page = this.pages[i]
        await page.close().catch(() => { i - 1 })
      }
      this.pages = []
      return resolve()
    })
  }

  _pickIdlPage (): BrowserPage {
    let idlPage: BrowserPage = {} as BrowserPage
    for (const page of this.pages) {
      if (page.idl === true) {
        idlPage = this._resetPageState(page)
        break
      }
    }
    return idlPage
  }

  _resetPageState (page: BrowserPage) {
    page.abort = false
    page.idl = true
    return page
  }
}
