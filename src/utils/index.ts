import path from 'path'
import readDirSync from './read_dir_sync'
const utilDir: string = path.join(__dirname, './')
const utilFiles: string[] = readDirSync(utilDir)
const res: { [key: string]: Function | object } = {}
utilFiles.forEach((file) => {
  if (/^index\.+/.test(file)) return false
  const fn: Function | object = require(path.join(utilDir, file))
  if (isFunction(<Function>fn)) {
    res[(fn as Function).name] = fn
  }
  if (isObject(<Object>fn)) {
    const obj = fn as {[key: string]: object}
    Object.keys(obj).forEach((key) => {
      res[key] = obj[key]
    })
  }
})

function isObject(likeObject: object): boolean {
  return Object.prototype.toString.call(likeObject) === '[object Object]'
}

function isFunction(likeFunction: Function): boolean {
  return Object.prototype.toString.call(likeFunction) === '[object Function]'            
}
module.exports = res
