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
