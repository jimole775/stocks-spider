import fs from 'fs'
import path from 'path'
import { getPathSeparator } from './get-path-separator'
export function buildPath(asbFilePath) {
  const isExist = fs.existsSync(asbFilePath)
  if (isExist) return asbFilePath
  let prevPath = ''
  const splitMark = getPathSeparator(asbFilePath)
  const pathArr = asbFilePath.split(splitMark)
  for (let i = 0; i < pathArr.length; i++) {
    if (!prevPath) prevPath = pathArr[0]
    else prevPath = path.join(prevPath, pathArr[i])
    const isDirExist = fs.existsSync(prevPath)
    if (!isDirExist && !/\.\w+$/i.test(pathArr[i])) fs.mkdirSync(prevPath)
  }
  return asbFilePath
}
