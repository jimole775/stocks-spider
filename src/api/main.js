require('./config')
const cmdParam = require('../utils/cmd-param')
const express = require('express')
const app = new express()
const kline = require('./kline')
const vline = require('./vline')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello world')
})
app.post('/api/kline', kline)
app.post('/api/vline', vline)
app.listen(cmdParam('port'))
