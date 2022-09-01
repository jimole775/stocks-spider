/**
 * 构造函数
 * @param { Number } limit
 * @return { BunchThread }
 */
export interface BunchThreadInterface {
  limit: number
  paramList: any[]
  taskQueue: Task[]
  taskLivingIds: number[]
  consumedIds: number[]
  taskLiving: number
}

export type Task = {
  (): Promise<any>;
  id: number
}

export type TaskEntity = (param: any, i: number) => Promise<any>
