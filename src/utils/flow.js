export function Flow () {
  this.taskQueue = []
}

Flow.prototype.use = function (task) {
  this.taskQueue.push(task)
}

Flow.prototype.done = function () {
  start(this.taskQueue)
}

function start (taskQueue) {
  return (res) => {
    const dispatch = () => {
      const task = taskQueue.shift()
      if (taskQueue.length) {
        return task(res, () => dispatch())
      }
    }
    dispatch()
  }
}

