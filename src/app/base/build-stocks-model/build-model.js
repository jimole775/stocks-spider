
const { readFileAsync, writeFileAsync } = require(`${global.srcRoot}/utils`)
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)
const urlPool = [
  urlModel.page.SHStockList,
  urlModel.page.SZStockList
]
/**
 * 
 * @return [{ code: [String], name: [String], marketName: [String], marketCode: [String | Number]}]  
 */
export function buildModel(page) {
  return new Promise((s, j) => {
    let allStocks = [
    ]

    loopLoadPage(0, s, j)
    async function loopLoadPage(i, s, j) {
      const url = urlPool[i]
      await page.goto(url)
      const content = await page.content().catch()
      if (content.length) { 
        const rightContext = queryContent(content)
        const typeMap = {
          0: 'sh', // 上海交易所
          1: 'sz', // 深圳交易所
        }
        const stockList = spillStockList(rightContext, typeMap[i])
        allStocks = allStocks.concat(stockList)
      } else {
        console.log('加载失败:', url)
        // j('加载失败:', url)
      }

      // 增加一个随机的延迟，防止被请求被屏蔽
      setTimeout(() => {
        if (i === urlPool.length - 1) {
          page.close()
          return s(allStocks)
        }
        return loopLoadPage(++i, s, j)
      }, Math.random() * 800 + Math.random() * 500 + Math.random() * 300)
    }
  }).catch(function(error) {
    console.error(error)
  })
}

function queryContent(htmlStr) {
  try {
    // 样例
    // .ngblistul2 <a href="*****600000.html">(600000)浦发银行</a>
    let ulContents = htmlStr.match(/<ul class="ngblistul2( hide)?">.*?<\/ul>/ig)
    let ulContentSpill = ''
    ulContents && ulContents.forEach(ulContent => {
      // 裁剪掉不规则标签
      ulContent = ulContent.replace(/<ul class="ngblistul2( hide)?">/ig, '')
      ulContent = ulContent.replace(/<\/ul>/ig, '')

      // 裁剪掉 "非数据" 的前半部
      ulContent = ulContent.replace(/<li><a href=".*?">/ig, '')

      // 最后裁剪掉 "()"
      ulContent = ulContent.replace(/\(/g, '')
      ulContent = ulContent.replace(/\)/g, ',')

      ulContentSpill += ulContent
    })

    // 裁剪掉 "非数据" 的后半部    
    return ulContentSpill.split('</a></li>')
  } catch (error) {
    console.error(error)
  }
}

function spillStockList(stocksTxt, tabType) {
  try {
    let loop = stocksTxt.length
    let stockModel = []
    while (loop--) {
      let item = stocksTxt[loop]
      let stockCode = item.split(',')[0]
      let stockName = item.split(',')[1]
      // 9或者2开头的股票属于B股，死股，缺乏很多数据，没必要记录
      if (/^[29]/.test(stockCode)) continue
      if (stockCode && stockName) {
        let model = {
          code: stockCode,
          marketCode: {
            sh:1,
            sz:2,
          }[tabType],
          marketName: tabType,
          name: stockName
        }
        stockModel.push(model)
      }
    }

    return stockModel
  } catch (error) {
    console.error('spillStockModel.spillStockList: ', error)
  }
}