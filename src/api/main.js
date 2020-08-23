require('./config')
const cmdParam = require('../utils/cmd-param')
const express = require('express')
const app = new express()
// const kline = require('./kline')
// const vline = require('./vline')
// const deals = require('./deals')
// const uline = require('./uline')
// const lowerpoint = require('./lowerpoint')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello world')
})
app.post('/api/kline', require('./kline'))
app.post('/api/vline', require('./vline'))
app.post('/api/uline', require('./uline'))
app.post('/api/deals', require('./deals'))
app.post('/api/lowerpoint', require('./lowerpoint'))
app.post('/api/dealline', require('./dealline'))
app.listen(cmdParam('port'))
