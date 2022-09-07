import mysql, { Connection } from 'mysql'
import { isDate } from '@/utils/assert'
import { MysqlPrototype, QueryMethod } from '@/interfaces/mysql.if'

type Callback = (result: string) => any
type Sqlmap = { [key: string]: number | string }

export default class Mysql implements MysqlPrototype {
  connection: Connection
  create: QueryMethod = create.bind(this)
  insert: QueryMethod = insert.bind(this)
  del : QueryMethod= del.bind(this)
  query: QueryMethod = query.bind(this)
  update: QueryMethod = update.bind(this)
  count = count.bind(this)
  custom = custom.bind(this)
  disconnect = disconnect.bind(this)
  constructor (option: { host: string, user: string, password: string, database: string }) {
    this.connection = mysql.createConnection({
      host     : option.host,
      user     : option.user,
      password : option.password
    })
    this.connection.connect()
    this.connection.query(`CREATE DATABASE IF NOT EXISTS ${option.database};`)
    this.connection.query(`USE ${option.database};`)
  }
}

function create (table: string, map: object, callback: Callback): Promise<string> {
  if (!table) return Promise.reject('创建表需要确认表名!')
  const entries: Array<Array<string>> = Object.entries(map)
  const sentences: Array<string> = []
  entries.forEach((entr) => {
    sentences.push(`${entr[0]} ${entr[1]} DEFAULT NULL`)
  })
  const sql = `CREATE TABLE IF NOT EXISTS ${table} (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ${sentences.join(',\n')},
    PRIMARY KEY(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`
  return handResult(sql, callback)
}

function insert (table: string, map: Sqlmap, callback: Callback): Promise<string> {
  if (!table) return Promise.reject('插入表单数据需要确认表单名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const sql    = `INSERT INTO ${table} (${keys}) VALUES (${values});`
  return handResult(sql, callback)
}

function del (table: string, map: Sqlmap, callback: Callback): Promise<string> {
  if (!table) return Promise.reject('删除表单数据需要确认表单名!')
  let sql = ``
  if (map) {
    const entities = Object.entries(map).map(entries => entries.join('='))
    sql =`DELETE FROM ${table} WHERE ${entities}`
  } else {
    sql =`DROP TABLE ${table}`
  }
  return handResult(sql, callback)
}

function query (table: string, map: Sqlmap, callback: Callback): Promise<string> {
  if (!table) return Promise.reject('查询表单数据需要确认表单名!')
  let limit:string = ''
  let query:string[] = []
  Object.entries(map).forEach(entries => {
    const key = entries[0]
    const value = entries[1]
    if (isDate(value)) {
      if (/start/.test(key)) {
        const startKey = key.replace(/start/, '').replace(/^\w/, (a) => a.toLocaleLowerCase())
        query.push(`${startKey}>='${value}'`)
      } else if (/end/.test(key)) {
        const endKey = key.replace(/end/, '').replace(/^\w/, (a) => a.toLocaleLowerCase())
        query.push(`${endKey}<='${value}'`)
      } else {
        query.push(`${key}='${value}'`)
      }
    } else if (key === 'page' || key === 'size') {
      const page = (map.page as number) || 1
      const size = (map.size as number) || 10
      limit = `${page*size},${size}`
    } else {
      query.push(`${key}=${value}`)
    }
  })
  let sql = `SELECT * FROM ${table}`
  if ((<Array<string>>query).length) {
    sql += ` WHERE ${query.join(' AND ')}`
  }
  if (limit) {
    sql += ` LIMIT ${limit}`
  }
  return handResult(sql, callback)
}

function update (table: string, map: Sqlmap, callback: Callback): Promise<string>  {
  if (!table) return Promise.reject('更新表单数据需要确认表单名!')
  const sql = `UPDATE ${table} SET (${mapToUpdateSql(map)}) WHERE id=${map.id};`
  return handResult(sql, callback)
}

function count (table: string, callback: (result: number) => any):Promise<number> {
  if (!table) return Promise.reject('需要确认表单名!')
  const sql = `SELECT count(*) FROM ${table}`
  return new Promise(function (this: Mysql, resolve, reject) {
    try {
      this.connection.query(sql, (err: string, result: Array<{'count(*)': number}>) => {
        if (err) return reject(err)
        const [row] = result || [{}]
        if (callback) callback(row['count(*)'])
        return resolve(row['count(*)'])
      })
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

function custom (table: string, sql: string, callback: Callback):Promise<string> {
  if (!table) return Promise.reject('需要确认表单名!')
  return handResult(sql, callback)
}

function disconnect (callback: () => any):Promise<void> {
  return new Promise(function (this: Mysql, resolve, reject) {
    this.connection.end((err: any) => {
      if (err) return reject(err)
      if (callback) callback()
      return resolve()
    })
  })
}

function mapToUpdateSql (map: Sqlmap): string {
  const res: string[] = []
  Object.entries(map).forEach(entries => {
    const key = entries[0]
    const val = entries[1]
    if (key !== 'id') {
      res.push(`${key}='${val}'`)
    }
  })
  return res.join(',')
}

function handResult (sql: string, callback: Callback): Promise<string> {
  return new Promise(function (this: Mysql, resolve, reject) {
    try {
      this.connection.query(sql, (err: string, result: string) => {
        if (err) return reject(err)
        if (callback) callback(result)
        return resolve(result)
      })
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

