import { initPage } from './init-page'
import { BunchThread } from './bunch-thread'
const pages = []
const limitBunch = global.concurrentLimit
export async function batchLinkC (urls, callback) {
  return new Promise((s, j) => {
    try {
      const bunch = new BunchThread(limitBunch)
      let loop = urls.length
      while (loop--) {
        const url = urls[loop]
        bunch.taskCalling(() => {
          // return new Promise(async ($$s, $$j) => {
          //   await taskEntity(url, callback)
          //     .catch((err) => { console.log(err) })
          //   return $$s(true)
          // })
          return taskEntity(url, callback)
        })
      }
      bunch.finally(() => {
        s(shutdownPages())
      })
    } catch (error) {
      return j(false)
    }
  })
}

function taskEntity (url, callback) {
  return new Promise(async (s, j) => {
    const idlPage = await buildPage(callback)
    idlPage.idl = false
    await idlPage.goto(url, { timeout: 0 })
      .catch((err) => { console.log(err) })
    idlPage.idl = true
    return s(true)
  })
}

function buildPage (callback) {
  return new Promise(async (s, j) => {
    let idlPage = null
    if (pages.length < limitBunch) {
      idlPage = await initPage(callback.onRequest, callback.onResponse)
        .catch((err) => { console.log(err) })
      pages.push(idlPage)
    } else {
      for (const page of pages) {
        if (page.idl) {
          idlPage = page
          break
        }
      }
    }
    return s(idlPage)
  })
}

function shutdownPages () {
  for (const page of pages) {
    page.close()
  }
}