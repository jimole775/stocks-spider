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
      // 核心步骤，把 dispatch(prevRes) 递归的操作封装成next函数，交给用户调用
      return task(data, (prevRes) => dispatch(prevRes))
    }
  }
  dispatch()
}

