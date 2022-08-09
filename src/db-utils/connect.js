const mysql      = require('mysql');
const config     = require('../../db_config.json');
const connection = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : 'stocks'
});
