require('@babel/register') // 转接外部模块的加载方式，amd改为common

function BunchThread (limit = 5, endCallback = () => {}) {
    this.limit = limit
    this.taskQueue = []
    this.taskLiving = 0
    this.taskCount = 0
    this.endCallback = endCallback
    return this
  }

  BunchThread.prototype.taskCalling = function(task) {
    this.taskCount ++
    if (this.taskLiving >= this.limit) {
      this.taskQueue.push(task)
    } else {
      this.thread(task)
    }
    this.taskLiving ++
    return this
  }

  BunchThread.prototype.thread = async function (task) {
    await task()
    this.taskLiving --
    if (this.taskQueue.length) {
      return this.thread(this.taskQueue.shift())
    } else {
      if (this.taskLiving <= 0) {
        this.endCallback && this.endCallback()
      }
    }
  }
  BunchThread.prototype.finally = async function (callback) {
    this.endCallback = callback
  }

const bunch = new BunchThread(5)
let loop = 23
while(loop--) {
  bunch.taskCalling((($$loop) => {
    return () => {
      return new Promise((s) => {
        setTimeout(() => {
          console.log($$loop)
          return s()
        }, 2000)
      })
    }
  })(loop))
}

bunch.finally(() => {
  console.log('call end')
})