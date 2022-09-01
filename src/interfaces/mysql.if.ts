const mysql = require('mysql')
export type Sqlmap = { [key: string]: number | string }
export type Callback = (result: string) => any
export type QueryMethod = (table: string, map: Sqlmap, callback: Callback) => Promise<string>

export interface MysqlInterface {
  connection: typeof mysql
  create: QueryMethod
  insert: QueryMethod
  del: QueryMethod
  query: QueryMethod
  update: QueryMethod
  count (table: string, callback: (result: number) => any): Promise<number>
  custom (table: string, sql: string, callback: Callback): Promise<string>
  disconnect (callback: () => any): Promise<string>
}
