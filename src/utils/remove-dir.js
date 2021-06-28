const fs = require('fs')
const path = require('path')
/**
 * 删除目录【慎用】
 * @param { String } asbFilePath 绝对路径
 * @return { undefined }
 */
module.exports = async function removeDir(asbFilePath) {
  console.log('asbFilePath:', asbFilePath)
  const isExist = fs.existsSync(asbFilePath)
  if (!isExist) return false
  return await fs.rmdirSync(asbFilePath)
}
