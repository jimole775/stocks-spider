require('./config')
const cmdParam = require('../utils/cmd-param')
const express = require('express')
const resHandler = require('./res-handler')
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

app.post('/api/kline', resHandler(require('./kline')))
app.post('/api/vline', resHandler(require('./vline')))
app.post('/api/uline', resHandler(require('./uline')))
app.post('/api/deals', resHandler(require('./deals')))
app.post('/api/finalDealDate', resHandler(require('./finalDealDate')))
app.post('/api/lowerpoint', resHandler(require('./lowerpoint')))
app.post('/api/dealline', resHandler(require('./dealline')))
app.listen(cmdParam('port'))
