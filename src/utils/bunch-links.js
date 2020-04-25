import { initPage } from './init-page'
import { BunchThread } from './bunch-thread'
export class BunchLinks {
  constructor (limit = global.bunchLimit) {
    this.limitBunch = limit
    this.pages = []
    this.bunch = new BunchThread(limit)
    this.request = () => { return [] }
    this.response = () => { return [] }
    this.batchEnd = () => { return [] }
    return this
  }

  on ({ request, response, batchEnd }) {
    if (request) this.request = request
    if (response) this.response = response
    if (batchEnd) this.batchEnd = batchEnd
    return this
  }

  async dispatching (urls) {
    await this.buildPage()
    return new Promise((s, j) => {
      return this.loop(urls, s, j)
    })
  }
  loop (urls, s, j) {
    urls.forEach((url) => {
      this.bunch.taskCalling(() => {
        return this.taskEntity(url)
      })
    })
    this.bunch.finally(async () => {
      let remainUrls = this.batchEnd()
      if (remainUrls && remainUrls.length) {
        console.log('remainUrls: ', remainUrls.length)
        return this.loop(remainUrls, s, j)
      } else {
        console.log('loop end！shutting down pages!')
        await this.shutdownPages()
        return s()
      }
    })
  }
  taskEntity (url) {
    return new Promise(async (s, j) => {
      let idlPage = this.pickIdlPage()
      idlPage.idl = false
      await idlPage.goto(url, { timeout: 0 }).catch(() => {
        console.log('idlPage.goto error')
      })
      idlPage.idl = true
      return s(true)
    })
  }

  buildPage () {
    return new Promise(async (s, j) => {
      for (let i = 0; i < this.limitBunch; i++) {
        let idlPage
        idlPage = await initPage(this.request, this.response)
        idlPage.id = '_id_' + i
        idlPage.idl = true
        this.pages.push(idlPage)
      }
      return s()
    })
  }

  shutdownPages () {
    return new Promise(async (s, j) => {
      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i]
        await page.close().catch(() => { i - 1})
      }
      this.pages = []
      return s()
    })
  }

  pickIdlPage () {
    let idlPage
    for (const page of this.pages) {
      if (page.idl) {
        idlPage = page
        break
      }
    }
    return idlPage
  }
}