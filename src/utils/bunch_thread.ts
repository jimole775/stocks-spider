import { BunchThreadInterface, Task, TaskEntity } from '@/interfaces/bunch_thread.if'
export * from '@/interfaces/bunch_thread.if'
const bunch_log_prev: string = 'utils.BunchThread => '
/**
 * 并发线程
 */
export default class BunchThread implements BunchThreadInterface {
  limit: number
  paramList: any[]
  taskQueue: Task[]
  taskLivingIds: number[]
  consumedIds: number[]
  taskLiving: number
  taskEntity: TaskEntity
  endCallback: Function
  constructor(limit?: number) {
    this.limit = limit ? limit : global.$bunchLimit
    this.paramList = []
    this.taskQueue = []
    this.taskLivingIds = []
    this.consumedIds = []
    this.taskLiving = 0
    this.taskEntity = () => Promise.resolve()
    this.endCallback = () => console.log('Bunch End!')
    return this
  }

  /**
   * 注册执行函数
   * @param { Array<any> } paramList
   * @param { Function } taskEntity
   * @return { BunchThread }
   */
  register(paramList: any[], taskEntity: TaskEntity): BunchThread {
    this.paramList = paramList
    this.taskEntity = taskEntity
    return this
  }

  /**
   * 并发发起
   * @return { BunchThread }
   */
  async emit(): Promise<BunchThread> {
    if (this.paramList && this.paramList.length) {
      const max = this.paramList.length
      for (let i = 0; i < max; i++) {
        const param: any = this.paramList[i]
        const task: Task = async () => {
          await this.taskEntity(param, i)
          return Promise.resolve()
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
    return Promise.resolve(this)
  }

  /**
   * 单任务调用方式
   * @param { Function } $$task
   * @return { BunchThread }
   */
  taskCalling($$task: Task): BunchThread {
    if (this.taskLiving >= this.limit) {
      this.taskQueue.push($$task)
    } else {
      this._thread($$task)
    }
    this.taskLiving++
    return this
  }

  /**
   * 注册并发结束的回调
   * @param { Function } callback
   * @return { BunchThread }
   */
  finally(callback: Function): BunchThread {
    this.endCallback = callback
    return this
  }

  async _taskNormalConsume() {
    if (this.taskQueue.length) {
      const task: Task = <Task>this.taskQueue.shift()
      await task()
      this._livingIdReduce(task)
    }
  }

  _livingIdReduce(task: Task) {
    const idIndex = this.taskLivingIds.indexOf(task.id)
    this.taskLivingIds.splice(idIndex, 1)
    this.consumedIds.push(task.id)
    if (this.consumedIds.length === this.paramList.length) {
      this.endCallback()
    }
  }

  _waitConsumeUnderLimit(): Promise<any> {
    return new Promise((resolve, reject) => {
      return this._consumeLoop(resolve)
    })
  }

  async _consumeLoop(resolve: Function): Promise<any> {
    if (this.taskLivingIds.length < this.limit) {
      return resolve()
    } else {
      if (this.taskQueue.length) {
        const task: Task = <Task>this.taskQueue.shift()
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
  async _thread($$task: Task): Promise<any> {
    try {
      await $$task()
    } catch (error) {
      // 报错了不处理，让每个任务注入前自己处理自己的异常
      console.log(bunch_log_prev, '_thread error:', error)
    }

    // 如果是 busy 模式，每个任务执行后需要睡眠指定的时间
    // 默认为 3 秒，可以在 global.config 里面进行配置
    if (global.$onBusyNetwork) {
      await this._sleep(global.$sleepTimes)
    }
    this.taskLiving--
    if (this.taskQueue.length) {
      return this._thread(<Task>this.taskQueue.shift())
    } else {
      if (this.taskLiving <= 0) {
        this.taskLiving = 0
        return this.endCallback()
      }
    }
  }

  _sleep(time: number): Promise<any> {
    return new Promise((s, j) => {
      setTimeout(s, time)
    })
  }
}

function test () {
  const bunch = new BunchThread(1)
  const temps: any[] = new Array(100).fill(1)
  bunch.register(temps, (item, i) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(i)
        return resolve('')
      }, Math.random() * 3000)
    })
  })
  bunch.emit()
}

if (!global.$env) {
  global.$sleepTimes = 3000
  global.$bunchLimit = 10
  global.$onBusyNetwork = false
  test()
}