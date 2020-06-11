const fs = require('fs')
const path = require('path')
const removeDir = require('./remove-dir')
const getPathSeparator = require('./get-path-separator')
module.exports = function removeSiblingDir(asbFilePath) {
  const pathMark = getPathSeparator(asbFilePath)
  const pathArrs = asbFilePath.split(pathMark)
  const targetFlodar = pathArrs.pop()
  const parentDir = pathArrs.join(pathMark)
  const curLevelFlodars = fs.readdirSync(parentDir)
  const sibilingFlodars = curLevelFlodars.filter(dir => dir !== targetFlodar)
  sibilingFlodars.forEach(sibFlodar => removeDir(path.join(parentDir, sibFlodar)))
}
