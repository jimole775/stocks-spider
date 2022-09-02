const fs = require('fs')
/**
 * 删除目录【慎用】
 * @param { String } asbFilePath 绝对路径
 * @return { undefined }
 */
export default async function removeDir(asbFilePath: string): Promise<any> {
  const isExist = fs.existsSync(asbFilePath)
  if (!isExist) return false
  console.log('remove dir:', asbFilePath)
  return fs.rmdirSync(asbFilePath)
}
