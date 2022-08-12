const path = require('path')
const removeFile = require(`../src/utils/remove-file.js`)
const writeFileSync = require('../src/utils/write-file-sync.js')
const baseData = require(`G:\\my_db\\stocks-spider\\base.json`)
const db_stocks = `G:\\my_db\\stocks-spider\\stocks`
baseData.data.forEach((item, index) => {
  console.log('i:', index)
  removeFile(path.join(db_stocks, item.code, 'deals', '2022-08-11.json'))
})
