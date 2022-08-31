const fs = require('fs')
const path = require('path')
const removeDir = require('./remove-dir')
const getPathSeparator = require('./get-path-separator')
/**
 * 删除目录的相邻目录【慎用】
 * @param { String } asbFilePath 绝对路径
 * @return { undefined }
 */
module.exports = function removeSiblingDir(asbFilePath) {
  const pathMark = getPathSeparator(asbFilePath)
  const pathArrs = asbFilePath.split(pathMark)
  const targetFlodar = pathArrs.pop()
  const parentDir = pathArrs.join(pathMark)
  const curLevelFlodars = fs.readdirSync(parentDir)
  const sibilingFlodars = curLevelFlodars.filter(dir => dir !== targetFlodar)
  sibilingFlodars.forEach(sibFlodar => removeDir(path.join(parentDir, sibFlodar)))
}
