const fs = require('fs')
module.exports = function readDirSync(dir) {
  let folderOrFiles = []
  try {
    const isExist = fs.existsSync(dir)
    if (!isExist) return folderOrFiles
    folderOrFiles = fs.readdirSync(dir)
  } catch (error) {
    folderOrFiles = []
  }
  return folderOrFiles
}
