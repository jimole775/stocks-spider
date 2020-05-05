import { initPage } from './init-page'
export async function batchLink(urls, callback) {
  return new Promise((s, j) => excution(s, j, urls, callback)).catch(err => err)
}

async function excution(s, j, urls, callback) {
  const page = await initPage(callback.onRequest, callback.onResponse)
  return loopLink(0, page)
  async function loopLink(i, page) {
    const url = urls[i]
    await page.goto(url, { timeout: 0 })
    .catch(err => {
      i--
      console.log(err)
    })
    
    if (i === urls.length - 1) {
      console.log('loading end')
      await page.close()
      return s(true)
    }
    return loopLink(++i, page)
  }
} 