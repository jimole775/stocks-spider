import fs from 'fs'
import { buildPath } from './build_path'
import { isArray, isObject } from './assert'
/**
 * 
 * @param { String } asbFilePath
 * @param { * } data
 * @return { Undefined }
 * @template writeFileSync('xxx/xxx.xx', 'text')
 * @template writeFileSync('xxx/xxx.xx', [...])
 * @template writeFileSync('xxx/xxx.xx', {...})
 */
 export function writeFileSync (asbFilePath: string, data: any): void {
  try {
    buildPath(asbFilePath)
    if (isArray(data) || isObject(data)) {
      data = JSON.stringify(data)
    }
    fs.writeFileSync(asbFilePath, data, 'utf8')
  } catch (error) {
    console.log('writeFileSync => error:', error)
  }
}
