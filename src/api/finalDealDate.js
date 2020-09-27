const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const code_name = require(`${global.db_dict}/code-name.json`)
const name_code = require(`${global.db_dict}/name-code.json`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const quest = require(`${global.utils}/quest`)
const moment = require('moment')
module.exports = function base (req, res) {
  return new Promise(async (resolve) => {
    const stocks = readDirSync(path.join(global.db_stocks))
    const pickOneStock = stocks.pop()
    const dateFiles = readDirSync(path.join(global.db_stocks, pickOneStock, 'deals'))
    return resolve({date: dateFiles.pop().split('.').shift()})
  })
}
