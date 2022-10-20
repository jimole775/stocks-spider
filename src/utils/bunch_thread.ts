import { waitBy } from './wait_by'
import { BunchThreadInterface, TaskParam, TaskEntity } from '@/interfaces/bunch_thread'
export * from '@/interfaces/bunch_thread'
const bunch_log_prev: string = 'utils.BunchThread => '
/**
 * 并发线程
 */
export class BunchThread implements BunchThreadInterface {
  isDone: boolean
  bunchLimit: number
  taskLivingId: number
  taskLivingIds: number[]
  taskLength: number
  paramList: any[]
  paramQueue: TaskParam[]
  consumedIds: number[]
  taskEntity: TaskEntity
  endCallback: Function
  constructor(bunchLimit?: number) {
    this.bunchLimit = bunchLimit ? bunchLimit : global.$bunchLimit
    this.isDone = false
    this.paramList = []
    this.paramQueue = []
    this.taskLivingIds = []
    this.consumedIds = []
    this.taskLivingId = 0
    this.taskLength = 0
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
    this.taskLength = paramList.length
    this.taskEntity = taskEntity
    return this
  }

  /**
   * 并发发起
   * @return { BunchThread }
   */
  async emit(): Promise<BunchThread> {
    await this._doTaskComsuming()
    await this._waitingTaskFinished()
    return Promise.resolve(this)
  }

  isLastQueue (taskId: number) {
    return this.taskLength - taskId <= this.bunchLimit
  }

  async _doTaskComsuming () {
    if (this.paramList && this.paramList.length) {
      for (let i = 0; i < this.taskLength; i++) {
        const param: any = this.paramList[i]
        this.taskLivingId = i
        this.taskLivingIds.push(i)
        this.paramQueue.push({ param, id: i })
        console.log('任务剩余：', this.taskLength - this.taskLivingId)
        if (this.taskLivingIds.length >= this.bunchLimit) {
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
    // await waitBy(() => this.consumedIds.length === this.paramList.length)
    const loopEntity = async (loopResolve: Function): Promise<any> => {
      if (this.consumedIds.length === this.paramList.length) {
        console.log('BunchThread emit end!')
        this.isDone = true
        await this.endCallback()
        this.reset()
        return loopResolve()
      } else {
        return setTimeout(() => {
          return loopEntity(loopResolve)
        }, 500)
      }
    }
    return new Promise((resolve: Function) => {
      return loopEntity(resolve)
    })
  }

  /**
   * 单任务调用方式
   * @param { Function } $$task
   * @return { BunchThread }
   */
  // taskCalling($$task: Task): BunchThread {
  //   if (this.taskLivingId >= this.bunchLimit) {
  //     this.paramQueue.push($$task)
  //   } else {
  //     this._thread($$task)
  //   }
  //   this.taskLivingId++
  //   return this
  // }

  /**
   * 注册并发结束的回调
   * @param { Function } callback
   * @return { BunchThread }
   */
  finally(callback: Function): BunchThread {
    this.endCallback = callback
    return this
  }

  async _taskNormalConsume(): Promise<void> {
    if (this.paramQueue.length) {
      const taskParam: TaskParam = <TaskParam>this.paramQueue.shift()
      await this.taskEntity(taskParam.param) // 每个task在当前业务场景中，就是每个页面执行goto方法，然后监听每个请求的内容
      this._livingIdReduce(taskParam.id)
      return Promise.resolve()
    }
  }

  _livingIdReduce(id: number) {
    const idIndex = this.taskLivingIds.indexOf(id)
    this.taskLivingIds.splice(idIndex, 1)
    this.consumedIds.push(id)
  }

  _waitConsumeUnderLimit(): Promise<any> {
    return new Promise((resolve, reject) => {
      return this._consumeLoop(resolve)
    })
  }

  async _consumeLoop(resolve: Function): Promise<any> {
    if (this.taskLivingIds.length < this.bunchLimit) {
      return resolve()
    } else {
      if (this.paramQueue.length) {
        const taskParam: TaskParam = <TaskParam>this.paramQueue.shift()
        await this.taskEntity(taskParam.param)
        this._livingIdReduce(taskParam.id) // todo 需要判断这里是否会出现task消费的遗漏
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
  // async _thread($$task: Task): Promise<any> {
  //   try {
  //     await $$task()
  //   } catch (error) {
  //     // 报错了不处理，让每个任务注入前自己处理自己的异常
  //     console.log(bunch_log_prev, '_thread error:', error)
  //   }

  //   // 如果是 busy 模式，每个任务执行后需要睡眠指定的时间
  //   // 默认为 3 秒，可以在 global.config 里面进行配置
  //   if (global.$onBusyNetwork) {
  //     await this._sleep(global.$sleepTimes)
  //   }
  //   this.taskLivingId--
  //   if (this.paramQueue.length) {
  //     return this._thread(<Task>this.paramQueue.shift())
  //   } else {
  //     if (this.taskLivingId <= 0) {
  //       this.reset()
  //       return this.endCallback()
  //     }
  //   }
  // }

  reset () {
    this.paramList.length = 0
    this.paramQueue.length = 0
    this.taskLivingIds.length = 0
    this.consumedIds.length = 0
    this.taskLivingId = 0
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