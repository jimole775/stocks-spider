
export class BunchThread {
  constructor (limit = 5, endCallback = () => { console.log('auto end') }) {
    this.limit = limit
    this.taskQueue = []
    this.taskLiving = 0
    this.endCallback = endCallback
    return this
  }

  taskCall (task) {
    if (this.taskLiving >= this.limit) {
      this.taskQueue.push(task)
    } else {
      this.thread(task)
    }
    this.taskLiving ++
    return this
  }

  async thread (task) {
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

  final (callback) {
    this.endCallback = callback
  }
}