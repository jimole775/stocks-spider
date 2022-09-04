const fs = require('fs')
const path = require('path')
const base = require(global.$path.db.base_data)
const codeMap = {}
const nameMap = {}
module.exports = function () {
  base.data.forEach((stockItem) => {
    codeMap[stockItem.code] = stockItem.name
    nameMap[stockItem.name] = stockItem.code
  })
  fs.writeFileSync(path.join(global.$path.db.dict, 'code-name.json'), JSON.stringify(codeMap))
  fs.writeFileSync(path.join(global.$path.db.dict, 'name-code.json'), JSON.stringify(nameMap))
}
