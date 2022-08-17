// const os = require('os-utils')
const LogTag = 'utils.BunchThread => '
/**
 * 并发线程
 */
class BunchThread {
  /**
   * 构造函数
   * @param { Number } limit
   * @param { Function } endCallback
   * @return { BunchThread }
   */
  constructor (limit = global.bunchLimit, endCallback = () => { console.log('auto end') }) {
    this.limit = limit
    this.paramList = []
    this.taskQueue = []
    this.taskLivingIds = []
    this.taskLiving = 0
    this.endCallback = endCallback
    // this.updateCPU()
    return this
  }

  /**
   * 注册
   * @param { Array } paramList
   * @param { Function } taskEntity
   */
  register (paramList, taskEntity) {
    this.paramList = paramList || []
    this.taskEntity = taskEntity || function () {}
  }

  async emit () {
    if (this.paramList && this.paramList.length) {
      for (let i = 0; i < this.paramList.length; i++) {
        const param = this.paramList[i]
        const task = async () => {
          await this.taskEntity(param, i)
        }
        task.id = i
        this.taskQueue.push(task)
        this.taskLivingIds.push(i)
        if (this.taskLivingIds.length >= this.limit) {
          await this.waitConsumeUnderLimit()
        } else {
          this.taskNormalConsume()
        }
      }
    }
  }

  async taskNormalConsume () {
    if (this.taskQueue.length) {
      const task = this.taskQueue.shift()
      await task()
      this.livingIdReduce(task)
    }
  }

  livingIdReduce (task) {
    const idIndex = this.taskLivingIds.indexOf(task.id)
    this.taskLivingIds.splice(idIndex, 1)
  }

  waitConsumeUnderLimit () {
    return new Promise((resolve, reject) => {
      return this.consumeLoop(resolve)
    })
  }

  async consumeLoop (resolve) {
    if (this.taskLivingIds.length < this.limit) {
      return resolve()
    } else {
      if (this.taskQueue.length) {
        const task = this.taskQueue.shift()
        await task()
        this.livingIdReduce(task)
        return this.consumeLoop(resolve)
      }
    }
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
    return Promise.resolve()
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
    // 默认为 3 秒，可以在 global.config 里面进行配置
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

  livingMap () {
    for (let i = 0; i < this.limit; i++) {
      this.taskMark[i] = null
    }
  }
  // updateCPU () {
  //   setTimeout(() => {
  //     os.cpuUsage((value) => {
  //       console.log(value)
  //       this.updateCPU()
  //     })
  //   }, 0)
  // }
}

function test () {
  const bunch = new BunchThread(5)
  bunch.register(new Array(100).fill(1), (item, i) => {
    return new Promise((s, j) => {
      setTimeout(() => {
        console.log(i)
        s()
      }, Math.random() * 3000)
    })
  })
  bunch.emit()
}

if (!global.env) {
  global.sleepTimes = 3000
  global.bunchLimit = 10
  global.onBusyNetwork = false
  test()
}

module.exports = BunchThread
