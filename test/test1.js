// const Bunch = require('../src/utils/bunch-thread.js')
// const b = new Bunch(10)

const data = new Array(100).fill(Math.random())

;(async function () {
  for (let i = 0; i < data.length; i++) {
    const el = data[i]
    console.log('s:', i)
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
    console.log('end:', i)
  }
})()
