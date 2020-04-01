
export function BunchThread (limit = 5) {
  this.taskQueue = []
  this.limit = limit
  this.taskLiving = 0
  this.threadEnd = 0
}

BunchThread.prototype.threadManager = function (task) {
  if (this.taskLiving >= this.limit) {
    this.taskQueue.push(task)
  } else {
    this.thread(task)
  }
  this.taskLiving ++
}

BunchThread.prototype.thread = async function (task) {
  await task()
  this.threadEnd ++
  if (this.taskQueue.length) {
    this.taskLiving --
    this.threadEnd --
    return this.thread(this.taskQueue.shift())
  } else {
    if (this.threadEnd === this.limit && this.taskLiving === 0) {
      console.log('closed')
    }
  }
}

