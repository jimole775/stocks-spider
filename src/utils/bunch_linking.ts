import { Page, Request, Response } from 'puppeteer'
import { BunchThread } from './bunch_thread'
import { initPage } from './init_page'
const LogTag = 'utils.BunchLinking => '

export interface BrowserPage extends Page {
  idl: boolean,
  id: string
}

export type BunchLinkingResponse = Response

export type BunchLinkingRequest = Request

export type BunchLinkingResponseEvent = (e: Response, ...args: any[]) => void

export type BunchLinkingRequestEvent = (e: Request, ...args: any[]) => void


/**
 * 并发请求，html类型
 * 主要是访问一个主页，然后从页面上探测所有接口
 */
export class BunchLinking {
  limitBunch: number
  bunch: BunchThread
  pages: BrowserPage[]
  urls: string[]
  request: BunchLinkingRequestEvent
  response: BunchLinkingResponseEvent
  end: Function
  constructor (urls: string[] = [], limit: number = global.$bunchLimit) {
    this.limitBunch = limit
    this.urls = urls
    this.bunch = new BunchThread(limit)
    this.pages = []
    this.request = () => { return [] }
    this.response = () => { return [] }
    this.end = () => { return [] }
    return this
  }

  on (option: { request?: BunchLinkingRequestEvent, response?: BunchLinkingResponseEvent, end?: Function }) {
    if (option.request) this.request = option.request
    if (option.response) this.response = option.response
    if (option.end) this.end = option.end
    return this
  }

  async emit () {
    await this._buildPage()
    return new Promise((resolve, reject) => {
      return this._loop(this.urls, resolve, reject)
    })
  }

  _loop (urls: string[], resolve: Function, reject: Function) {
    this.bunch.register(urls, async (url: string): Promise<void> => {
      await this._taskEntity(url)
      return Promise.resolve()
    })
    .finally(async () => {
      let remainUrls = this.end()
      if (remainUrls && remainUrls.length) {
        console.log(LogTag, 'remainUrls: ', remainUrls.length)
        return this._loop(remainUrls, resolve, reject)
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
        idlPage.idl = true
        return resolve()
      } else {
        return reject()
      }
    })
  }

  _buildPage (): Promise<void> {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.limitBunch; i++) {
        const idlPage: BrowserPage = await initPage(this.request, this.response) as BrowserPage
        idlPage.id = '_id_' + i
        idlPage.idl = true
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
      if (page.idl) {
        idlPage = page
        break
      }
    }
    return idlPage
  }
}
