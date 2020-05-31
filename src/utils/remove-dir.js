const fs = require('fs')
const path = require('path')
module.exports = async function removeDir(asbFilePath) {
  console.log('asbFilePath:', asbFilePath)
  const isExist = fs.existsSync(asbFilePath)
  if (!isExist) return false
  return await fs.rmdirSync(asbFilePath)
}
