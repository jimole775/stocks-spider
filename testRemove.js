require('@babel/register') // 转接外部模块的加载方式，amd改为common
// const removeSiblingDir = require('./src/utils/remove-sibling-dir')
const removeSiblingDir = require('F:\\MyPro\\stocks\\src\\utils')
// const path = require('path')
// removeSiblingDir(path.join(__dirname, '/test111/asd'))

console.log(removeSiblingDir)