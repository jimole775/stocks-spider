const connect = require('./src/utils/connect-stock')
const path = require('path')
const writeFileSync = require('./src/utils/write-file-sync')
const readdir = 'src/db/warehouse/peer-deals'
const writedir = 'src/db/warehouse/peer-deals-new'
connect(readdir, (data, date, stock) => {
  let hp = 0
  let ep = 0
  let dp = 9999999
  data.data && data.data.forEach((deal) => {
    if (deal.p > hp) hp = deal.p
    if (deal.p < dp) dp = deal.p
    ep = deal.p
  })
  data.hp = hp
  data.dp = dp
  data.ep = ep
  writeFileSync(path.join(writedir, date, stock + '.json'), data)
})

