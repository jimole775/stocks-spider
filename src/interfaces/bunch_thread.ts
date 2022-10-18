/**
 * 构造函数
 * @param { Number } limit
 * @return { BunchThread }
 */
export interface BunchThreadInterface {
  paramList: any[]
  taskQueue: Task[]
  taskLivingIds: number[]
  consumedIds: number[]
  taskLiving: number
  taskLength: number
}

export type Task = {
  (): Promise<any>;
  id: number
}

export type TaskEntity = (param: any, i?: number) => Promise<any>
