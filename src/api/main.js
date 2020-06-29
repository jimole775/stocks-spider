const koa = require('koa')
const app = new koa()
const router = require('koa-router')()
const kline = require('./kline')
const vline = require('./vline')
router.get('/')
router.get('/api/kline', kline)
router.get('/api/vline', vline)
app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());
app.listen(9527)