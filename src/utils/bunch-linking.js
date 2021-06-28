const initPage = require('./init-page')
const BunchThread = require('./bunch-thread')
const LogTag = 'utils.BunchLinking => '
/**
 * 并发请求，html类型
 * 主要是访问一个主页，然后从页面上探测所有接口
 */
module.exports = class BunchLinking {
  /**
   * @param { Array<String> } urls
   * @param { Number } limit 默认3条
   * @return { BunchLinking }
   */
  constructor (urls = [], limit = global.bunchLimit) {
    this.limitBunch = limit
    this.urls = urls
    this.pages = []
    this.bunch = new BunchThread(limit)
    this.request = () => { return [] }
    this.response = () => { return [] }
    this.end = () => { return [] }
    return this
  }

  on ({ request, response, end }) {
    if (request) this.request = request
    if (response) this.response = response
    if (end) this.end = end
    return this
  }

  async emit () {
    await this._buildPage()
    return new Promise((s, j) => {
      return this._loop(this.urls, s, j)
    })
  }

  _loop (urls, s, j) {
    urls.forEach((url) => {
      this.bunch.taskCalling(() => {
        return this._taskEntity(url)
      })
    })
    this.bunch.finally(async () => {
      let remainUrls = this.end()
      if (remainUrls && remainUrls.length) {
        console.log(LogTag, 'remainUrls: ', remainUrls.length)
        return this._loop(remainUrls, s, j)
      } else {
        console.log(LogTag, 'loop end！shutting down pages!')
        await this._shutdownPages()
        return s()
      }
    })
  }

  _taskEntity (url) {
    return new Promise(async (s, j) => {
      const idlPage = this._pickIdlPage()
      idlPage.idl = false
      await idlPage.goto(url, { timeout: 0 })
        .catch((err) => console.log(LogTag, 'idlPage.goto:', err))
      idlPage.idl = true
      return s(true)
    })
  }

  _buildPage () {
    return new Promise(async (s, j) => {
      for (let i = 0; i < this.limitBunch; i++) {
        const idlPage = await initPage(this.request, this.response)
        idlPage.id = '_id_' + i
        idlPage.idl = true
        this.pages.push(idlPage)
      }
      return s()
    })
  }

  _shutdownPages () {
    return new Promise(async (s, j) => {
      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i]
        await page.close().catch(() => { i - 1})
      }
      this.pages = []
      return s()
    })
  }

  _pickIdlPage () {
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
