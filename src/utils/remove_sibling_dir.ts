import fs from 'fs'
import path from 'path'
import { removeDir } from './remove_dir'
import { getPathSeparator } from './get_path_separator'
/**
 * 删除目录的相邻目录【慎用】
 * @param { String } asbFilePath 绝对路径
 * @return { undefined }
 */
 export function removeSiblingDir (asbFilePath: string): void {
  const pathMark = getPathSeparator(asbFilePath)
  const pathArrs = asbFilePath.split(pathMark)
  const targetFlodar = pathArrs.pop()
  const parentDir = pathArrs.join(pathMark)
  const curLevelFlodars = fs.readdirSync(parentDir)
  const sibilingFlodars = curLevelFlodars.filter((dir: string) => dir !== targetFlodar)
  sibilingFlodars.forEach((sibFlodar: string) => removeDir(path.join(parentDir, sibFlodar)))
}
