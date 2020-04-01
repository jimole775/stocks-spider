export function StepFlow () {
  this.taskQueue = []
}

StepFlow.prototype.use = function (task) {
  this.taskQueue.push(task)
}

StepFlow.prototype.done = function (callback) {
  startFlow(this.taskQueue)
}

function startFlow (taskQueue) {
  const dispatch = (data) => {
    if (taskQueue.length) {
      const task = taskQueue.shift()
      return task(data, (prevRes) => dispatch(prevRes))
    }
  }
  dispatch()
}

