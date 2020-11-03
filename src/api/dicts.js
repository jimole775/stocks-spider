const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const { transferStock } = require('./toolkit')
const basePath = `${global.db_dict}`
const dirMap = {
  code_name: 'code-name',
  name_code: 'name-code',
}
const model = {
  dict: null,
}
module.exports = function deals (req, res) {
  return new Promise((resolve) => {
    let { name } = req.body
    // stock 和 queryDate 为必填
    if (!name) {
      return resolve('请明确字典名！')
    }
    const db_path = path.join(basePath, dirMap[name] + '.json')
    model.dict = readFileSync(db_path)
    return resolve(model)
  })
}
