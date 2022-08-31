const fs = require('fs')
const path = require('path')
const getPathSeparator = require('./get-path-separator')
/**
 * 不用担心无目录的错误
 * @param { String } asbFilePath 绝对路径
 * @return { String } 返回已创建的目录
 * @template buildPath('xxxxxx/xxxxxx') => 'xxxxxx/xxxxxx'
 */
module.exports = function buildPath(asbFilePath) {
  const isExist = fs.existsSync(asbFilePath)
  if (isExist) return asbFilePath
  let prevPath = ''
  const splitMark = getPathSeparator(asbFilePath)
  const pathArr = asbFilePath.split(splitMark)
  for (let i = 0; i < pathArr.length; i++) {
    if (!prevPath) prevPath = pathArr[0]
    else prevPath = path.join(prevPath, pathArr[i])
    const isDirExist = fs.existsSync(prevPath)
    if (!isDirExist && !/\.\w+$/i.test(pathArr[i])) fs.mkdirSync(prevPath)
  }
  return asbFilePath
}
