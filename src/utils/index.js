const path = require('path')
const readDirSync = require('./read-dir-sync')
const utilDir = path.join(__dirname, './')
const utilFiles = readDirSync(utilDir)
const res = {}
utilFiles.forEach((file) => {
  if (file === 'index.js') return false
  const fn = require(path.join(utilDir, file))
  if (isFunction(fn)) {
    res[fn.name] = fn
  }
  if (isObject(fn)) {
    const obj = fn
    Object.keys(obj).forEach((key) => {
      res[key] = obj[key]
    })
  }
})

function isObject(likeObject) {
  return Object.prototype.toString.call(likeObject) === '[object Object]'
}

function isFunction(likeFunction) {
  return Object.prototype.toString.call(likeFunction) === '[object Function]'            
}

module.exports = res
// module.exports = {
//   ...require('./assert'),
//   Link: require('./link'),
//   sleep: require('./sleep'),
//   clone: require('./clone'),
//   quest: require('./quest'), // superagent的封装
//   unique: require('./unique'), // 去重
//   toMoney: require('./to-money'),
//   diffrence: require('./diffrence'), // 比对
//   initPage: require('./init-page'),
//   cmdParam: require('./cmd-param'),
//   buildPath: require('./build-path'),
//   removeDir: require('./remove-dir'),
//   hasUnlinks: require('./has-unlinks'),
//   BunchThread: require('./bunch-thread'),
//   readDirSync: require('./read-dir-sync'),
//   connectStock: require('./connect-stock'),
//   BunchLinking: require('./bunch-linking'),
//   readFileSync: require('./read-file-sync'),
//   writeFileSync: require('./write-file-sync'),
//   recordUsedApi: require('./record-used-api'),
//   dealApiFactory: require('./deal-api-factory'),
//   klineApiFactory: require('./kline-api-factory'),
//   hasRefreshLinks: require('./has-refresh-links'),
//   removeSiblingDir: require('./remove-sibling-dir'),
//   getPathSeparator: require('./get-path-separator'), // 获取路径分隔符
//   requestApiInBunch: require('./request-api-in-bunch'),
// }
