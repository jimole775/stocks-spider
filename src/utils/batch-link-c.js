import { initPage } from './init-page'
import { BunchThread } from './bunch-thread'
const pages = []
const limitBunch = global.concurrentLimit
export async function batchLinkC (urls, {
  onRequest,
  onResponse,
  onBatchEnd = () => {return []}
}) {
  await buildPage (onRequest, onResponse)
  return new Promise((s, j) => {
    return loopFn (urls, onBatchEnd, s, j)
  })
}

function loopFn (urls, onBatchEnd, s, j) {
  const bunch = new BunchThread(limitBunch)
  urls.forEach((url) => {
    bunch.taskCalling(() => {
      return taskEntity(url)
    })
  })
  bunch.finally(async () => {
    let remainUrls = onBatchEnd()
    if (remainUrls.length) {
      console.log('remainUrls: ', remainUrls.length)
      return loopFn(remainUrls, onBatchEnd, s, j)
    } else {
      console.log('loop end！shutting down pages!')
      await shutdownPages()
      return s()
    }
  })
}

function taskEntity (url) {
  return new Promise(async (s, j) => {
    let idlPage = pickIdlPage()
    idlPage.idl = false
    await idlPage.goto(url, { timeout: 0 }).catch(() => {
      console.log('idlPage.goto error')
    })
    idlPage.idl = true
    return s(true)
  })
}

function buildPage (onRequest, onResponse) {
  return new Promise(async (s, j) => {
    for (let i = 0; i < limitBunch; i++) {
      let idlPage
      idlPage = await initPage(onRequest, onResponse)
      idlPage.id = '_id_' + i
      idlPage.idl = true
      pages.push(idlPage)
    }
    return s()
  })
}

function shutdownPages () {
  return new Promise((s, j)=>{
    return loopShut(pages.pop(), s, j)
    async function loopShut (page, s, j) {
      await page.close().catch()
      if (pages.length) {
        return loopShut(pages.pop(), s, j)
      } else {
        return s()
      }
    }
  })
}

function pickIdlPage () {
  let idlPage
  for (const page of pages) {
    if (page.idl) {
      idlPage = page
      break
    }
  }
  return idlPage
}