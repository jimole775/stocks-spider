import path from 'path'
import readDirSync = require('./read_dir_sync')
const utilDir: string = path.join(__dirname, './')
const utilFiles: string[] = readDirSync(utilDir)
const res: { [key: string]: Function | object } = {}
utilFiles.forEach((file) => {
  if (/^index\.+/.test(file)) return false
  const fn: any = require(path.join(utilDir, file))
  if (isFunction(<Function>fn)) {
    res[fn.name] = fn
  }
  if (isObject(<Object>fn)) {
    const obj = fn
    Object.keys(obj).forEach((key) => {
      res[key] = obj[key]
    })
  }
})

function isObject(likeObject: {}) {
  return Object.prototype.toString.call(likeObject) === '[object Object]'
}

function isFunction(likeFunction: Function) {
  return Object.prototype.toString.call(likeFunction) === '[object Function]'            
}
module.exports = res
