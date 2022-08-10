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
    entities.push(`${key} ${map[key]} NOT NULL`)
  })
  const sql = `CREATE TABLE ${table} IF NOT EXISTS (
    id INT NOT NULL UNSIGNED AUTO_INCREMENT, ${entities}, PRIMARY KEY(id)
  );`
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

Mysql.prototype.query = function (table, map) {
  if (!table) return throw new Error('查询表单数据需要确认表单名!')
  const keys   = Object.keys(map)
  const values = Object.values(map)
  const sql    = `INSERT INTO ${table} (${keys}) VALUES (${values});`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}

Mysql.prototype.update = function (table, map) {
  if (!table) return throw new Error('更新表单数据需要确认表单名!')
  // const keys   = Object.keys(map)
  // const values = Object.values(map)
  const id = map.id
  delete map.id
  const sql    = `UPDATE ${table} SET (${updateEntity}) WHERE id=${map.id};`
  try {
    this.connection.query(sql)
  } catch (error) {
    console.log(error)
  }
}


function getObjectEntity (src) {
  const updateEntity = JSON.stringify(src)
  updateEntity.replace()
}

module.exports = Mysql
