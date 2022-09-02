const fs = require('fs')
const buildPath = require('./build-path')
const { isArray, isObject } = require('./assert')
/**
 * 
 * @param { String } asbFilePath
 * @param { * } data
 * @return { Undefined }
 * @template writeFileSync('xxx/xxx.xx', 'text')
 * @template writeFileSync('xxx/xxx.xx', [...])
 * @template writeFileSync('xxx/xxx.xx', {...})
 */
 export default function writeFileSync (asbFilePath: string, data: any): void {
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
