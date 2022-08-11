const mysql      = require('mysql')
const config     = require('../../db_config.json')
function Mysql {
  this.connection = {}
}

Mysql.prototype.connect = function (option) {
  this.connection = mysql.createConnection({
    host     : option.host,
    user     : option.user,
    password : option.password,
    database : option.database
  })
  this.connection.connect()
}

Mysql.prototype.create = function (table, map) {
  if (!table) return throw new Error('创建表需要确认表名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const entities = []
  Object.keys((key) => {
    entities.push(`${key} ${map[key]} DEFAULT NULL`)
  })
  const sql = `CREATE TABLE ${table} IF NOT EXISTS (
    id INT NOT NULL UNSIGNED AUTO_INCREMENT, ${entities}, PRIMARY KEY(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}

Mysql.prototype.insert = function (table, map) {
  if (!table) return throw new Error('插入表单数据需要确认表单名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const sql    = `INSERT INTO ${table} (${keys}) VALUES (${values});`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}

// Mysql.prototype.delete = function (table, map) {
//   if (!table) return throw new Error('插入表单数据需要确认表单名!')
//   const keys   = Object.keys(map)
//   const values = Object.values(map)
//   const sql    = `INSERT INTO ${table} (${keys}) VALUES (${values});`
//   try {
//     this.connection.query(sql)
//   } catch (error) {
//     console.log(error)
//   }
// }

Mysql.prototype.query = function (table, map) {
  if (!table) return throw new Error('查询表单数据需要确认表单名!')
  // const keys   = Object.keys(map)
  // const values = Object.values(map)
  const querysql = []
  // const { page, size = 10 } = map
  // if (page) {
  //   querysql.push(`limit ${page*size},${size}`)
  // }
  Object.keys(map).forEach(key => {
    if (key === 'page') {
      querysql.push(`limit ${map.page*map.size},${map.size}`)
    }
  })
  const sql = `SELECT * FROM ${table} WHERE ${querysql}`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}

Mysql.prototype.update = function (table, map) {
  if (!table) return throw new Error('更新表单数据需要确认表单名!')
  const sql = `UPDATE ${table} SET (${mapToUpdateSql(map)}) WHERE id=${map.id};`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
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
