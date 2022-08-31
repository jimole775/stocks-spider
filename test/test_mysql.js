const Mysql = require('../src/db/Mysql.js')
const config = require('../db_config.json')
const mysql = new Mysql(config['yiibai'])
mysql.query('orders', {
  startRequiredDate: '2013-10-01',
  endRequiredDate: '2013-11-01',
  page: 1,
  size: 10
}).then((res) => {
  console.log(res)
})
mysql.finish()