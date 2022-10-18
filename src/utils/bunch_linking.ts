import { Page, Request, Response } from 'puppeteer'
import { BunchThread } from './bunch_thread'
import { isCSSUrl, isImgUrl } from './assert'
const LogTag = 'utils.BunchLinking => '

export interface BrowserPage extends Page {
  idl: boolean,
  id: string
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
    this.limitBunch = limit
    this.urls = urls
    this.bunchThread = new BunchThread(limit)
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
    await this._consumeUrls(this.urls)
    return Promise.resolve()
  }

  _consumeUrls (urls: string[]): Promise<void> {
    const loop = (_urls: string[], resolve: Function) => {
      this.bunchThread.register(_urls, async (url: string): Promise<void> => {
        // todo 这里无法准确监听 每个 url 的采集情况
        // todo 只能在response回调中去回收等待的任务id
        await this._taskEntity(url)
        console.log('bunchThread item exec end: ', url)
        return Promise.resolve()
      })
      .finally(async () => {
        let remainUrls = this.end()
        console.log('idl pages id when process end: ', this.pages.filter(i => i.idl).map(i => i.id))
        if (remainUrls && remainUrls.length) {
          console.log(LogTag, 'remainUrls: ', remainUrls.length)
          return loop(remainUrls, resolve)
        } else {
          console.log(LogTag, 'loop end, shutting down pages!')
          await this._shutdownPages(this.pages)
          return resolve()
        }
      })
      .emit()
    }

    return new Promise((resolve) => {
      return loop(urls, resolve)
    })
  }

  _taskEntity (url: string): Promise<void> {
    return new Promise(async (resolve) => {
      const idlPage: BrowserPage = await this._pickIdlPage(this.pages)
      if (idlPage.goto) {
        await idlPage.goto(url, { timeout: 0 }).catch((err: string) => {
          console.log(LogTag, 'idlPage.goto err:', url)
          return resolve()
        })
        console.log('idlPage.goto end: ', url)
        return resolve()
      } else {
        return resolve()
      }
    })
  }

  _buildPages (): Promise<void> {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i <= this.limitBunch; i++) {
        const idlPage: BrowserPage = await global.$browser.newPage() as BrowserPage
        await idlPage.setRequestInterception(true)
        idlPage.on('request', async (interceptedRequest: Request) => {
          if (isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url()) || idlPage.idl === true) {
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
              idlPage.idl = true
            }
          })
        }
        idlPage.id = '_id_' + i
        idlPage.idl = true
        this.pages.push(idlPage)
      }
      return resolve()
    })
  }

  _shutdownPages (pages: BrowserPage[]): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < pages.length; i++) {
        const page: Page = pages[i]
        await page.close().catch(() => { i - 1 })
      }
      pages = []
      return resolve()
    })
  }

  _pickIdlPage (pages: BrowserPage[]): Promise<BrowserPage> {
    return new Promise((resolve: Function) => {
      return loop(pages, resolve)
      function loop (srcs: BrowserPage[], end: Function) {
        const idlPage: BrowserPage = srcs.find(i => i.idl) as BrowserPage
        if (idlPage) {
          idlPage.idl = false
          return end(idlPage)
        } else {
          setTimeout(() => {
            return loop(srcs, end)
          }, 15)
        }
      }
    })
  }
}
