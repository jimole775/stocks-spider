import fs from 'fs'
import yaml from 'js-yaml'
export function readFile(filePath) {
  let data = null
  try {
    const isExist = fs.existsSync(filePath)
    if (!isExist) return data
    if (/\.ya?ml$/i.test(filePath)) {
      data = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
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