const mysql      = require('mysql')
const assert     = require('../../utils/assert')
function Mysql (option) {
  this.connection = mysql.createConnection({
    host     : option.host,
    user     : option.user,
    password : option.password
  })
  this.connection.connect()
  this.connection.query(`CREATE DATABASE IF NOT EXISTS ${option.database};`)
  this.connection.query(`USE ${option.database};`)
}

// Mysql.prototype.connection = {}

// Mysql.prototype.connect = function (option) {
// }

Mysql.prototype.create = function (table, map, callback) {
  if (!table) return new Error('创建表需要确认表名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const entities = []
  keys.forEach((key) => {
    entities.push(`${key} ${map[key]} DEFAULT NULL`)
  })
  const sql = `CREATE TABLE IF NOT EXISTS ${table} (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ${entities.join(',\n')},
    PRIMARY KEY(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`
  return new Promise((resolve, reject) => {
    try {
      this.connection.query(sql, (err, result) => {
        if (err) return reject(err)
        if (callback) callback(result)
        resolve(result)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.insert = function (table, map, callback) {
  if (!table) return new Error('插入表单数据需要确认表单名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const sql    = `INSERT INTO ${table} (${keys}) VALUES (${values});`
  return new Promise((resolve, reject) => {
    try {
      this.connection.query(sql, (err, result) => {
        if (err) return reject(err)
        if (callback) callback(result)
        resolve(result)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.delete = function (table, map) {
  if (!table) return new Error('删除表单数据需要确认表单名!')
  let sql = ``
  if (map) {
    const entities = Object.entries(map).map(entries => entries.join('='))
    sql =`DELETE FROM ${table} WHERE ${entities}`
  } else {
    sql =`DROP TABLE ${table}`
  }
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}

Mysql.prototype.query = function (table, map, callback) {
  if (!table) return new Error('查询表单数据需要确认表单名!')
  let limit = ''
  let query = []
  Object.keys(map).forEach(key => {
    const value = map[key]
    if (assert.isDate(value)) {
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
      limit = `${map.page*map.size},${map.size}`
    } else {
      query.push(`${key}=${value}`)
    }
  })
  let sql = `SELECT * FROM ${table}`
  if (query.length) {
    sql += ` WHERE ${query.join(' AND ')}`
  }
  if (limit) {
    sql += ` LIMIT ${limit}`
  }
  console.log('asdasd', table, map, sql)
  return new Promise((resolve, reject) => {
    try {
      this.connection.query(sql, (err, result) => {
        console.log('1111', err, result)
        if (err) return reject(err)
        if (callback) callback(result)
        resolve(result)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.update = function (table, map, callback) {
  if (!table) return new Error('更新表单数据需要确认表单名!')
  return new Promise((resolve, reject) => {
    const sql = `UPDATE ${table} SET (${mapToUpdateSql(map)}) WHERE id=${map.id};`
    try {
      this.connection.query(sql, (err, result) => {
        if (err) return reject(err)
        if (callback) callback(result)
        resolve(result)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.count = function (table, callback) {
  if (!table) return new Error('需要确认表单名!')
  return new Promise((resolve, reject) => {
    try {
      this.connection.query(`SELECT count(*) FROM ${table}`, (err, result) => {
        if (err) return reject(err)
        const [row] = result || [{}]
        if (callback) callback(row['count(*)'])
        resolve(row['count(*)'])
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.custom = function (table, sql, callback) {
  if (!table) return new Error('需要确认表单名!')
  return new Promise((resolve, reject) => {
    try {
      this.connection.query(sql, (err, result) => {
        if (err) return reject(err)
        if (callback) callback(result)
        resolve(result)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Mysql.prototype.disconnect = function (callback) {
  return new Promise((resolve, reject) => {
    this.connection.end(function(err) {
      if (err) return reject(err)
      if (callback) callback()
      resolve()
    })
  })
}

function mapToUpdateSql (map) {
  const cmap = { ...map }
  delete cmap.id // 去掉 id 字段
  const res = []
  Object.keys(cmap).forEach(key => {
    res.push(`${key}='${cmap[key]}'`)
  })
  return res.join(',')
}

module.exports = Mysql
