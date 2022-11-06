import { writeFileSync } from '../src/utils/write_file_sync'
import baseData from 'G:\\my_db\\stocks-spider\\base.json'
// const newData = baseData.data.map(item => {
//   if (item.dealApi) {
//     if (item.dealApi.id) {
//       item.dealApi.dt = 0
//     }
//     if (item.dealApi.secid) {
//       item.dealApi.dt = 1
//     }
//   }
// })
// const limit = 1000
for (let i = 0; i < baseData.data.length; i++) {
  const item = baseData.data[i]
  // if (i >= limit) break
  if (item.dealApi) delete item.dealApi
}

writeFileSync(`G:\\my_db\\stocks-spider\\base.json`, baseData)
