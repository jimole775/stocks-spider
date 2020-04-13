import { initPage } from './init-page'
import { BunchThread } from './bunch-thread'
const pageStore = []
const limitBunch = global.concurrentLimit
export async function batchLinkC (urls, callback) {
  return new Promise((s, j) => {
    try {
      const bunch = new BunchThread(limitBunch)
      let loopTimes = urls.length
      while (loopTimes--) {
        const url = urls[loopTimes]
        bunch.taskCall(() => {
          return new Promise(async (s, j) => {
            try {
              await taskEntity(url, callback)
              return s(true)
            } catch (error) {
              return j(false)
            }
          })
        })
      }
      bunch.final(() => {
        s(shutdownPages())
      })
    } catch (error) {
      return j(false)
    }
  })
}

// function threadManager (task) {
//   if (taskLiving >= limitBunch) {
//     taskQueue.push(task)
//   } else {
//     thread(task)
//   }
// }

// async function thread (task) {
//   taskLiving ++
//   await task()
//   if (taskQueue.length > 0) {
//     taskLiving --
//     return thread(taskQueue.shift())
//   }
// }

function taskEntity (url, callback) {
  return new Promise(async (s, j) => {
    const idlPage = await createPages(callback)
    idlPage.idl = false
    await idlPage.goto(url, { timeout: 0 })
    .catch((err) => {
      console.log(err)
    })
    idlPage.idl = true
    return s(true)
  })
}

function createPages (callback) {
  return new Promise(async (s, j) => {
    let idlPage = {}
    if (pageStore.length < limitBunch) {
      idlPage = await initPage(callback.onRequest, callback.onResponse)
      pageStore.push(idlPage)
    } else {
      for (const page of pageStore) {
        if (page.idl) {
          idlPage = page
          break
        }
      }
    }
    return s(idlPage)
  })
}

async function shutdownPages (alivePages) {
  const bussingPages = []
  for (const page of alivePages) {
    if (page.idl) {
      await page.close()
    } else {
      bussingPages.push(page)
    }
  }
  if (bussingPages.length) {
    return shutdownPages(bussingPages)
  }
}