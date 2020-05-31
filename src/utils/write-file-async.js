const fs = require('fs')
const buildPath = require('./build-path')
const { isArray, isObject } = require('./assert')
module.exports = function writeFileAsync(asbFilePath, data) {
  let fd = null
  try {
    buildPath(asbFilePath)
    if (isArray(data) || isObject(data)) {
      data = JSON.stringify(data)
    }
    fd = fs.writeFileSync(asbFilePath, data, 'utf8')
  } catch (error) {
    console.log('writeFileAsync:', error)
    fd = null
  }
  return fd
}
