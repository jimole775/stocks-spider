import { SerialThreadInterface, TaskEntity } from '@/interfaces/serial_thread'
/**
 * 并发线程
 */
export class SerialThread implements SerialThreadInterface {
  taskLiving: boolean
  taskQueue: TaskEntity[]
  endCallback: Function
  constructor() {
    this.taskQueue = []
    this.taskLiving = false
    this.endCallback = () => console.log('Bunch End!')
    return this
  }

  async call (task: TaskEntity): Promise<void> {
    if (this.taskLiving) {
      this.taskQueue.push(task)
      await this._comsumming()
    } else {
      if (this.taskQueue.length) {
        await this._comsumming()
      } else {
        this.taskLiving = true
        await task()
        this.taskLiving = false
      }
    }
    return Promise.resolve()
  }

  async _comsumming (): Promise<void>  {
    if (this.taskLiving) {
      this._evalInLoop()
    } else {
      if (this.taskQueue.length) {
        this.taskLiving = true
        const curTask = this.taskQueue.shift() as TaskEntity
        await curTask()
        this._evalInLoop()
      }
    }
    this.taskLiving = false
    return Promise.resolve()
  }

  _evalInLoop () {
    if (this.taskQueue.length) {
      setTimeout(() => {
        return this._comsumming()
      }, 145)
    }
  }

  _sleep(time: number): Promise<any> {
    return new Promise((s, j) => {
      setTimeout(s, time)
    })
  }
}

function test () {
  const thread = new SerialThread()
  thread.call(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve('')
      }, 3000)
    })
  })
}

if (!global.$env) {
  test()
}
