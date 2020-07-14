const cmdParam = require('../utils/cmd-param')
const express = require('express')
const app = new express()
const kline = require('./kline')
const vline = require('./vline')
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded  
app.use(bodyParser.urlencoded({ extended: false }))    

// parse application/json  
app.use(bodyParser.json())   

app.post('/api/kline', kline)
app.post('/api/vline', vline)
app.listen(cmdParam('port'))