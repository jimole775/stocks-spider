require('@babel/register') // 转接外部模块的加载方式，amd改为common
const { Flow } = require('./src/utils')
const flow = new Flow()

flow.use((data, next) => {
  console.log('11111')
  next('test')
  console.log('22222')
})

flow.use((data, next) => {
  console.log('aaaaa')
  next()
  console.log(data)
  console.log('bbbbb')
})

flow.done()