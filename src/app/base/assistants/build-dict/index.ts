import { StockStoreModel } from '@/types/stock'
import fs from 'fs'
import path from 'path'
const codeMap: { [key: string]: string} = {}
const nameMap: { [key: string]: string}  = {}
export default function () {
  const base = require(global.$path.db.base_data)
  base.data.forEach((stockItem: StockStoreModel) => {
    codeMap[stockItem.code] = stockItem.name
    nameMap[stockItem.name] = stockItem.code
  })
  fs.writeFileSync(path.join(global.$path.db.dict, 'code-name.json'), JSON.stringify(codeMap))
  fs.writeFileSync(path.join(global.$path.db.dict, 'name-code.json'), JSON.stringify(nameMap))
  return Promise.resolve()
}
