const initPage = require('./init-page')
/**
 * 单线程
 */
module.exports = class Link {
  /**
   * @param { String } url
   */
  constructor (url) {
    this.url = url
    this.page = {}
    this.request = () => {}
    this.response = () => {}
    this.end = () => {}
  }

  on ({ request, response, end }) {
    if (request) this.request = request
    if (response) this.response = response
    if (end) this.end = end
    return this
  }

  async emit () {
    this.page = await initPage(this.request, this.response)
    return new Promise((s, j) => {
      return this.emitHandler(this.url, s, j)
    })
  }

  async emitHandler (url, s, j) {
    try {
      await this.page.goto(url, { timeout: 0 })
      await this.shutdownPage()
      return s()
    } catch (error) {
      console.log(error)
      return this.emitHandler (url, s, j)
    }
  }

  shutdownPage () {
    return new Promise((s, j) => {
     return this.shutdownHandler(s, j)
    })
  }

  async shutdownHandler (s, j) {
    try {
      return s(await this.page.close())
    } catch (error) {
      return setTimeout(() => this.shutdownHandler(s, j), 15)
    }
  }
}
