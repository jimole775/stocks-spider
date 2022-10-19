/**
 * 构造函数
 * @param { Number } limit
 * @return { BunchThread }
 */
export interface BunchThreadInterface {
  paramList: any[]
  paramQueue: TaskParam[]
  taskLivingId: number
  taskLivingIds: number[]
  consumedIds: number[]
  taskLength: number
}

export type TaskParam = {
  // (): Promise<any>;
  param: any
  id: number
}

export type TaskEntity = (param: any, i?: number) => Promise<any>
