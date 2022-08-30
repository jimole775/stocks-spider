const mysql = require('mysql')
export interface MysqlInterface {
  connection: typeof mysql
  create: Function
  insert: Function
  del: Function
  query: Function
  update: Function
  count: Function
  custom: Function
  disconnect: Function
}
