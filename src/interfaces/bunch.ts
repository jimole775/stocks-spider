export interface BunchInterface {
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
}

export type Task = () => Promise<any> | any

export type TaskEntity = (param: any, i?: number) => Promise<any>
