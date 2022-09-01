const mysql = require('mysql')
type Sqlmap = { [key: string]: number | string }
type Callback = (result: string) => any
export default interface MysqlInterface {
  connection: typeof mysql
  create (table: string, map: Sqlmap, callback: Callback): Promise<string>
  insert (table: string, map: Sqlmap, callback: Callback): Promise<string>
  del (table: string, map: Sqlmap, callback: Callback): Promise<string>
  query (table: string, map: Sqlmap, callback: Callback): Promise<string>
  update (table: string, map: Sqlmap, callback: Callback): Promise<string>
  count (table: string, callback: (result: number) => any): Promise<number>
  custom (table: string, sql: string, callback: Callback): Promise<string>
  disconnect (callback: () => any): Promise<string>
}
