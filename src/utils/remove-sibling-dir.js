const fs = require('fs')
const path = require('path')
const removeDir = require('./remove-dir')
const getPathSeparator = require('./get-path-separator')
module.exports = function removeSiblingDir(asbFilePath) {
  const pathMark = getPathSeparator(asbFilePath)
  const pathArrs = asbFilePath.split(pathMark)
  const targetDir = pathArrs.pop()
  const prevDir = pathArrs.pop()
  const curLevelDirs = fs.readdirSync(prevDir)
  const sibilings = curLevelDirs.filter(dir => dir !== targetDir)
  sibilings.forEach(sibDir => 
    {
      console.log(path.join(pathArrs.join(pathMark), prevDir, sibDir))
      removeDir(path.join(pathArrs.join(pathMark), prevDir, sibDir))
    })
}
