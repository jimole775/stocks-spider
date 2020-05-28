import fs from 'fs'
import path from 'path'
export async function removeDir(asbFilePath) {
  const isExist = fs.existsSync(asbFilePath)
  if (!isExist) return false
  await fs.rmdirSync(asbFilePath)
  return true
}
