import { initPage } from './init-page'
import { BunchThread } from './bunch-thread'
const pages = []
const limitBunch = global.concurrentLimit
export async function batchLinkC (urls, checkRemainUrl, callback) {
  await buildPage (callback, pages)
  return new Promise((s, j) => {
    return loopFn (urls, checkRemainUrl, s, j)
  })
}

function loopFn (urls, checkRemainUrl, s, j) {
  const bunch = new BunchThread(limitBunch)
  urls.forEach((url) => {
    bunch.taskCalling(() => {
      return taskEntity(url)
    })
  })
  bunch.finally(async () => {
    let remainUrls = checkRemainUrl()
    console.log('remainUrls: ', remainUrls.length)
    if (remainUrls.length) {
      await shutdownPages(pages).catch()
      return loopFn(remainUrls, checkRemainUrl, s, j)
    } else {
      await shutdownPages(pages).catch()
      return s()
    }
  })
}

function taskEntity (url) {
  return new Promise(async (s, j) => {
    let idlPage = pickIdlPage(pages)
    idlPage.idl = false
    await idlPage.goto(url, { timeout: 0 }).catch(() => {
      console.log('idlPage.goto error')
    })
    idlPage.idl = true
    return s(true)
  })
}

function buildPage (callback, pages) {
  return new Promise(async (s, j) => {
    for (let i = 0; i < limitBunch; i++) {
      let idlPage
      idlPage = await initPage(callback.onRequest, callback.onResponse)
      idlPage.id = '_id_' + i
      idlPage.idl = true
      pages.push(idlPage)
    }
    return s()
  })
}

function shutdownPages (pages) {
  return new Promise((s, j)=>{
    return loopShut(pages.pop(), s, j)
    async function loopShut (page, s, j) {
      await page.close()
      if (pages.length) {
        return loopShut(pages.pop(), s, j)
      } else {
        return s()
      }
    }
  })
}

function pickIdlPage (pages) {
  let idlPage
  for (const page of pages) {
    if (page.idl) {
      idlPage = page
      break
    }
  }
  // if (!pageActT[idlPage.id]) {
  //   pageActT[idlPage.id] = 0
  // }
  // pageActT[idlPage.id] ++
  return idlPage
}