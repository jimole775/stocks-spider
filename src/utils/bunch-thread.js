
const os = require('os-utils')
export class BunchThread {
  constructor (limit = global.bunchLimit, endCallback = () => { console.log('auto end') }) {
    this.limit = limit
    this.taskQueue = []
    this.taskLiving = 0
    this.endCallback = endCallback
    // this.updateCPU()
    return this
  }

  taskCalling ($$task) {
    if (this.taskLiving >= this.limit) {
      this.taskQueue.push($$task)
    } else {
      this.thread($$task)
    }
    this.taskLiving ++
    return this
  }

  async thread ($$task) {
    await $$task().catch()
    this.taskLiving --
    if (this.taskQueue.length) {
      return this.thread(this.taskQueue.shift())
    } else {
      if (this.taskLiving <= 0) {
        this.taskLiving = 0
        this.endCallback && this.endCallback()
      }
    }
  }

  finally (callback) {
    this.endCallback = callback
  }

  updateCPU () {
    setTimeout(() => {
      os.cpuUsage((value) => {
        console.log(value)
        this.updateCPU()
      })
    }, 0)
  }
}