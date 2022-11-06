import { waitBy } from './wait_by'
import { ThreadInterface, TaskEntity, Task } from '@/interfaces/thread'
export * from '@/interfaces/thread'
/**
 * 模拟线程
 */
export class Thread implements ThreadInterface {
  isDone: boolean
  bunchLimit: number
  taskLivingCount: number
  taskConsumedCount: number
  taskLivingMap: Map<number, boolean>
  taskLength: number
  paramList: any[]
  taskQueue: Task[]
  taskEntity: TaskEntity
  endCallback: Function

  /**
  * 构造函数
  * @param { Number } bunchLimit
  */
  constructor(bunchLimit?: number) {
    this.bunchLimit = bunchLimit ? bunchLimit : global.$bunchLimit
    this.isDone = false
    this.paramList = []
    this.taskQueue = []
    this.taskLivingCount = 0
    this.taskConsumedCount = 0
    this.taskLivingMap = new Map()
    this.taskLength = 0
    this.taskEntity = () => Promise.resolve()
    this.endCallback = () => console.log('Bunch End!')
    return this
  }

  /**
   * 注册执行函数
   * @param { Array<any> } paramList
   * @param { Function } taskEntity
   * @return { Thread }
   */
  register(paramList: any[], taskEntity: TaskEntity): Thread {
    this.paramList = paramList
    this.taskLength = paramList.length
    this.taskEntity = taskEntity
    return this
  }

  /**
   * 并发发起
   * @return { Thread }
   */
  async emit(): Promise<Thread> {
    await this._doTaskBunchComsuming()
    await this._waitingTaskFinished()
    return Promise.resolve(this)
  }

  isLastQueue (taskId: number) {
    return this.taskLength - taskId <= this.bunchLimit
  }

  async _doTaskBunchComsuming () {
    if (this.paramList && this.paramList.length) {
      for (let i = 0; i < this.taskLength; i++) {
        const param: any = this.paramList.shift()
        this._livingCountUprise()
        this._taskConsumedRecord(i)
        this.taskQueue.push(() => this.taskEntity(param, i))
        // console.log('任务剩余：', this.taskLength - this.taskLivingId)
        if (this.taskLivingCount >= this.bunchLimit) {
          // 如果 this.taskLivingIds 溢出，就等待溢出部分消费完
          await this._waitConsumeUnderLimit()
        } else {
          // 正常消费，消费一条就删减 this.taskLivingIds 一次
          this._taskNormalConsume()
        }
      }
    }
    return Promise.resolve()
  }


  async _waitingTaskFinished () {
    const condition = function (this: Thread) {
      return this.taskConsumedCount === this.paramList.length
    }
    await waitBy(condition.bind(this))
    this.isDone = true
    await this.endCallback()
    this.reset()
    return Promise.resolve()
  }

  /**
   * 注册并发结束的回调
   * @param { Function } callback
   * @return { Thread }
   */
  finally(callback: Function): Thread {
    this.endCallback = callback
    return this
  }

  async call (task: Task): Promise<void> {
    if (this.isDone === false) {
      this.taskQueue.push(task)
      await this._doTaskSerialComsuming()
    } else {
      if (this.taskQueue.length) {
        await this._doTaskSerialComsuming()
      } else {
        this.isDone = false
        await task()
        this.isDone = true
      }
    }
    return Promise.resolve()
  }

  async _doTaskSerialComsuming (): Promise<void>  {
    if (this.isDone === false) {
      this._evalSerialInLoop()
    } else {
      if (this.taskQueue.length) {
        this.isDone = false
        const curTask = this.taskQueue.shift() as Task
        await curTask()
        this._evalSerialInLoop()
      }
    }
    this.isDone = true
    return Promise.resolve()
  }

  _evalSerialInLoop () {
    if (this.taskQueue.length) {
      setTimeout(() => {
        return this._doTaskSerialComsuming()
      }, 145)
    }
  }

  async _taskNormalConsume(): Promise<void> {
    if (this.taskQueue.length) {
      const task = this.taskQueue.shift() as Task
      await task() // 每个task在当前业务场景中，就是每个页面执行goto方法，然后监听每个请求的内容
      this._livingCountReduce()
      return Promise.resolve()
    }
  }

  _taskConsumedRecord(i: number) {
    this.taskLivingMap.set(i, true)
    this.taskConsumedCount = this.taskConsumedCount + 1
  }

  _livingCountUprise() {
    this.taskLivingCount = this.taskLivingCount + 1
  }

  _livingCountReduce() {
    this.taskLivingCount = this.taskLivingCount - 1
  }

  _waitConsumeUnderLimit(): Promise<any> {
    return new Promise(this._evalBunchInLoop.bind(this))
  }

  async _evalBunchInLoop(resolve: Function): Promise<any> {
    if (this.taskLivingCount < this.bunchLimit) {
      return resolve()
    } else {
      if (this.taskQueue.length) {
        const task = this.taskQueue.shift() as Task
        await task()
        this._livingCountReduce() // todo 需要判断这里是否会出现task消费的遗漏
        this._evalBunchInLoop(resolve)
      } else {
        return resolve()
      }
    }
  }

  reset () {
    this.paramList.length = 0
    this.taskQueue.length = 0
  }

  _sleep(time: number): Promise<any> {
    return new Promise((s, j) => {
      setTimeout(s, time)
    })
  }
}

function test () {
  const bunch = new Thread(1)
  const temps: any[] = new Array(100).fill(1)
  bunch.register(temps, (item, i) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('test:', i)
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
  console.log('thread test!')
  test()
}