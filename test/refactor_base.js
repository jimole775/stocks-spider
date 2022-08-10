const writeFileSync = require('../src/utils/write-file-sync.js')
const baseData = require(`G:\\my_db\\stocks-spider\\base.json`)
const newData = baseData.data.map(item => {
  if (item.dealApi) {
    if (item.dealApi.id) {
      item.dealApi.dt = 0
    }
    if (item.dealApi.secid) {
      item.dealApi.dt = 1
    }
  }
})
writeFileSync(`G:\\my_db\\stocks-spider\\base.json`, baseData)
