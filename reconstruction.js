const fs = require('fs')
const path = require('path')
function run() {
  const dates = [
    '2020-03-17',
    '2020-03-18',
    '2020-03-19',
    '2020-03-20',
  ]
  const dir = './src/db/warehouse/peer-deals'
  try {
    
  for (const date of dates) {
    const files = fs.readdirSync(path.join(dir, date))
    for (const file of files) {
      const data = fs.readFileSync(path.join(dir, date, file))
      const newData = restruc(date, data.toString())
      fs.writeFileSync(path.join(dir, date, file), newData)
      // fs.writeFileSync('./test.json', newData)
    }
  }
  } catch (error) {
    console.log(error)
  }
}

function restruc(date, data) {
  return `{"date":${new Date(date).getTime()},"data":${data}}`
}

run()