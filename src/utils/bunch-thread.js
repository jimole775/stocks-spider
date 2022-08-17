const LogTag = 'utils.BunchThread => '
/**
 * 并发线程
 */
class BunchThread {
  /**
   * 构造函数
   * @param { Number } limit
   * @return { BunchThread }
   */
  constructor (limit = global.bunchLimit) {
    this.limit = limit
    this.paramList = []
    this.taskQueue = []
    this.taskLivingIds = []
    this.consumedIds = []
    this.taskLiving = 0
    this.endCallback = () => console.log('Bunch End!')
    return this
  }

  /**
   * 注册执行函数
   * @param { Array } paramList
   * @param { Function } taskEntity
   * @return { BunchThread }
   */
  register (paramList, taskEntity) {
    this.paramList = paramList || []
    this.taskEntity = taskEntity || function () {}
    return this
  }

  /**
   * 并发发起
   * @return { BunchThread }
   */
  async emit () {
    if (this.paramList && this.paramList.length) {
      const max = this.paramList.length
      for (let i = 0; i < max; i++) {
        const param = this.paramList[i]
        const task = async () => {
          await this.taskEntity(param, i)
        }
        task.id = i
        this.taskQueue.push(task)
        this.taskLivingIds.push(i)
        console.log('并发剩余：', max - i)
        if (this.taskLivingIds.length >= this.limit) {
          await this._waitConsumeUnderLimit()
        } else {
          this._taskNormalConsume()
        }
      }
    }
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
      this._thread($$task)
    }
    this.taskLiving ++
    return this
  }

  /**
   * 注册并发结束的回调
   * @param { Function } callback
   * @return { BunchThread }
   */
  finally (callback) {
    this.endCallback = callback
    return this
  }

  async _taskNormalConsume () {
    if (this.taskQueue.length) {
      const task = this.taskQueue.shift()
      await task()
      this._livingIdReduce(task)
    }
  }

  _livingIdReduce (task) {
    const idIndex = this.taskLivingIds.indexOf(task.id)
    this.taskLivingIds.splice(idIndex, 1)
    this.consumedIds.push(task.id)
    if (this.consumedIds.length === this.paramList.length) {
      this.endCallback()
    }
  }

  _waitConsumeUnderLimit () {
    return new Promise((resolve, reject) => {
      return this._consumeLoop(resolve)
    })
  }

  async _consumeLoop (resolve) {
    if (this.taskLivingIds.length < this.limit) {
      return resolve()
    } else {
      if (this.taskQueue.length) {
        const task = this.taskQueue.shift()
        await task()
        this._livingIdReduce(task)
        return this._consumeLoop(resolve)
      } else {
        resolve()
      }
    }
  }

  /**
   * 线程实例
   * @param { Function } $$task
   * @return { Undefined }
   */
  async _thread ($$task) {
    try {
      await $$task()
    } catch (error) {
      // 报错了不处理，让每个任务注入前自己处理自己的异常
      console.log(LogTag, '_thread error:', error)
    }

    // 如果是 busy 模式，每个任务执行后需要睡眠指定的时间
    // 默认为 3 秒，可以在 global.config 里面进行配置
    if (global.onBusyNetwork) {
      await this._sleep(global.sleepTimes)
    }
    this.taskLiving --
    if (this.taskQueue.length) {
      return this._thread(this.taskQueue.shift())
    } else {
      if (this.taskLiving <= 0) {
        this.taskLiving = 0
        return this.endCallback()
      }
    }
  }

  _sleep (time) {
    return new Promise((s, j) => { 
      setTimeout(s, time)
    })
  }
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
