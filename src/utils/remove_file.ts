const fs = require('fs')
const fsPromises = require('fs/promises')
/**
 * 删除文件【慎用】
 * @param { String } asbFilePath 绝对路径
 * @return { undefined }
 */
export default async function removeFile(asbFilePath: string): Promise<any> {
  const isExist = fs.existsSync(asbFilePath)
  if (!isExist) return false
  console.log('remove file:', asbFilePath)
  return fsPromises.rm(asbFilePath)
}
