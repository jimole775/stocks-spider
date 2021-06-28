const fs = require('fs')
/**
 * 读取目录，读取不存在的目录不会报错，返回空数组
 * @param { String } dir
 * @return { Array<String> } 可能返回目录名和文件名的混合类型
 * @template readDirSync('xxx/xxx/') => ['xx.xx', 'xxx.xx', ['xxxx']]
 */
module.exports = function readDirSync(dir) {
  let folderOrFiles = []
  try {
    const isExist = fs.existsSync(dir)
    if (!isExist) return folderOrFiles
    folderOrFiles = fs.readdirSync(dir)
  } catch (error) {
    folderOrFiles = []
  }
  return folderOrFiles
}
