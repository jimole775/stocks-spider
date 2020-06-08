// require('@babel/register') // 转接外部模块的加载方式，amd改为common

// function BunchThread (limit = 5, endCallback = () => {}) {
//     this.limit = limit
//     this.taskQueue = []
//     this.taskLiving = 0
//     this.taskCount = 0
//     this.endCallback = endCallback
//     return this
//   }

//   BunchThread.prototype.taskCalling = function(task) {
//     this.taskCount ++
//     if (this.taskLiving >= this.limit) {
//       this.taskQueue.push(task)
//     } else {
//       this.thread(task)
//     }
//     this.taskLiving ++
//     return this
//   }

//   BunchThread.prototype.thread = async function (task) {
//     await task()
//     this.taskLiving --
//     if (this.taskQueue.length) {
//       return this.thread(this.taskQueue.shift())
//     } else {
//       if (this.taskLiving <= 0) {
//         this.endCallback && this.endCallback()
//       }
//     }
//   }
//   BunchThread.prototype.finally = async function (callback) {
//     this.endCallback = callback
//   }

// const bunch = new BunchThread(5)
// let loop = 23
// while(loop--) {
//   bunch.taskCalling((($$loop) => {
//     return () => {
//       return new Promise((s) => {
//         setTimeout(() => {
//           console.log($$loop)
//           return s()
//         }, 2000)
//       })
//     }
//   })(loop))
// }

// bunch.finally(() => {
//   console.log('call end')
// })

const querystring = require('querystring')
const res = querystring.parse('http://push2ex.eastmoney.com/getStockFenShi?pagesize=144&ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wzfscj&cb=jQuery1123011401122580670009_1584374552958&pageindex=0&id=0006522&sort=1&ft=1&code=000652&market=0&_=1584374552959')
console.log(res)