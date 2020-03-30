import fs from 'fs'
import { buildPath } from './build-path'
import { isArray, isObject } from './assert'
export function writeFile(asbFilePath, data) {
  let fd = null
  try {
    buildPath(asbFilePath)
    if (isArray(data) || isObject(data)) {
      data = JSON.stringify(data)
    }
    fd = fs.writeFileSync(asbFilePath, data, 'utf8')
  } catch (error) {
    console.log('writeFile:', error)
    fd = null
  }
  return fd
}
