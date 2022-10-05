import fs from 'fs'
import loader from 'js-yaml'
/**
 * 读取文件，读取不存在的文件不会报错，返回空
 * @param { String } filePath
 * @return { any } 根据读取的文件类型返回不同的数据
 * @template readFileSync('xxx/xxx/xxx.xx') => any
 */
export function readFileSync(filePath: string): any {
  let data = null
  try {
    const isExist = fs.existsSync(filePath)
    if (!isExist) return data
    if (/\.ya?ml$/i.test(filePath)) {
      data = loader.load(fs.readFileSync(filePath, 'utf8'))
    } else if (/\.json$/i.test(filePath)) {
      data = fs.readFileSync(filePath, 'utf8')
      data = data ? JSON.parse(data) : data
    } else {
      data = fs.readFileSync(filePath, 'utf8')
    }
  } catch (error) {
    data = null
  }
  return data
}
