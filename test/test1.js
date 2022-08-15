const Bunch = require('F:/my_pro/stocks/src/utils/bunch-thread.js')
const b = new Bunch(10)

new Array(100).fill(Math.random()).forEach(async (i) => {
  await b.taskCalling(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  })
})

console.log('end')
