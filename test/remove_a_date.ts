
import path from 'path'
import baseData from 'G:\\my_db\\stocks-spider\\base.json'
import { removeFile } from 'F:/my_pro/stocks/src/utils/remove_file'
const db_stocks = `G:\\my_db\\stocks-spider\\stocks`
const limit = 50
const date = '2022-10-12.json'
for (let i = 0; i < baseData.data.length; i++) {
  const item = baseData.data[i]
  if (i > limit) break
  removeFile(path.join(db_stocks, item.code, 'deals', date))
}
