const code_name = require(`${global.db_dict}/code-name.json`)
const name_code = require(`${global.db_dict}/name-code.json`)
function queryStockCode (stock) {
    // 如果是6位长度，确定就是股票代码
    // 否则就是股票名
    if (stock.length !== 6) {
      return name_code[stock]
    } else {
      return stock
    }
}


module.exports = {
  queryStockCode
}
