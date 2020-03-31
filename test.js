require('@babel/register') // 转接外部模块的加载方式，amd改为common
const { Flow } = require('./src/utils')
const flow = new Flow()

flow.use((data, next) => {
  debugger
  console.log('11111')
  next()
  console.log('22222')
})

flow.use((data, next) => {
  debugger
  console.log('aaaaa')
  next()
  console.log('bbbbb')
})

flow.done()