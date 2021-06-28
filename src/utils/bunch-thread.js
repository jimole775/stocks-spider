const os = require('os-utils')
const LogTag = 'utils.BunchThread => '
/**
 * 并发线程
 */
module.exports = class BunchThread {
  /**
   * 构造函数
   * @param { Number } limit
   * @param { Function } endCallback
   * @return { BunchThread }
   */
  constructor (limit = global.bunchLimit, endCallback = () => { console.log('auto end') }) {
    this.limit = limit
    this.taskQueue = []
    this.taskLiving = 0
    this.endCallback = endCallback
    // this.updateCPU()
    return this
  }

  /**
   * 线程调用
   * @param { Function } $$task
   * @return { BunchThread }
   */
  taskCalling ($$task) {
    if (this.taskLiving >= this.limit) {
      this.taskQueue.push($$task)
    } else {
      this.thread($$task)
    }
    this.taskLiving ++
    return this
  }

  /**
   * 线程实例
   * @param { Function } $$task
   * @return { Undefined }
   */
  async thread ($$task) {
    try {
      await $$task()
    } catch (error) {
      // 报错了不处理，让每个任务注入前自己处理自己的异常
      console.log(LogTag, 'thread error:', error)
    }

    // 如果是 busy 模式，每个任务执行后需要睡眠指定的时间
    // 默认为 3 秒，可以在global.config里面进行配置
    if (global.onBusyNetwork) {
      await this.sleep(global.sleepTimes * global.bunchLimit)
    }
    this.taskLiving --
    if (this.taskQueue.length) {
      return this.thread(this.taskQueue.shift())
    } else {
      if (this.taskLiving <= 0) {
        this.taskLiving = 0
        return this.endCallback && this.endCallback()
      }
    }
  }

  finally (callback) {
    this.endCallback = callback
  }

  sleep (time) {
    return new Promise((s, j) => { 
      setTimeout(s, time)
    })
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
