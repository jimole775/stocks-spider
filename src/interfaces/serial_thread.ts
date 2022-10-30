/**
 * 串行任务线程
 * @param { Number } limit
 * @return { SerialThread }
 */
export interface SerialThreadInterface {
  taskQueue: TaskEntity []
  taskLiving: boolean
}

export type TaskEntity = () => Promise<any>
