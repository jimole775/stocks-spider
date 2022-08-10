const fs = require('fs')
const path = require('path')
const readDirSync = require('./src/utils/read-dir-sync')
const buildPath = require('./src/utils/build-path')
const readdir = 'G:\\my_db\\stocks-spider\\stocks'
const writedir = 'G:\\my_db\\stocks-spider\\stocks_new'
const targetdir = 'peer-deals'
const ignoreDates = [
  '2020-03-17', '2020-03-18', '2020-03-19',
  '2020-03-20', '2020-03-23', '2020-03-24',
  '2020-03-25', '2020-03-26', '2020-03-27',
  '2020-03-30', '2020-03-31', '2020-04-01',
  '2020-04-02', '2020-04-03', '2020-04-07',
  '2020-04-08', '2020-04-09', '2020-04-10',
  '2020-04-13', '2020-04-14', '2020-04-15',
  '2020-04-16', '2020-04-17', '2020-04-20',
  '2020-04-21', '2020-04-22', '2020-04-23',
  '2020-04-24', '2020-04-27', '2020-04-28',
  '2020-04-29', '2020-04-30', '2020-05-06',
  '2020-05-07', '2020-05-08', '2020-05-12',
  '2020-05-13', '2020-05-14', '2020-05-15',
  '2020-05-18', '2020-05-19', '2020-05-20',
  '2020-05-21', '2020-05-22', '2020-05-25',
  '2020-05-26', '2020-05-27', '2020-05-28',
  '2020-05-29', '2020-06-01', '2020-06-02', 
  '2020-06-03', '2020-06-04', '2020-06-05',
  '2020-06-08'
]
const stocks = readDirSync(readdir)
for (let index = 0; index < stocks.length; index++) {
  const stock = stocks[index]
  const dates = readDirSync(path.join(readdir, stock, targetdir))
  buildPath(path.join(writedir, stock, 'deals'))
  for (let j = 0; j < dates.length; j++) {
    const date = dates[j]
    fs.copyFileSync(path.join(readdir, stock, targetdir, date), path.join(writedir, stock, 'deals', date))
  }
}
// connect(readdir, ignoreDates, (data, date, stock) => {
//   const target = path.join(writedir, stock, 'deals', date + '.json')
//   if (!fs.existsSync(target)) {
//     console.log(date, stock)
//     writeFileSync(target, data)
//   }
// })

