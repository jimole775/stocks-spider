
const { readFileSync } = require(`${global.srcRoot}/utils`)
const urlModel = readFileSync(`${global.srcRoot}/url-model.yml`)
const urlPool = [
  urlModel.page.SHStockList,
  urlModel.page.SZStockList
]
/**
 * 
 * @return [{ code: [String], name: [String], mCode: [String | Number]}]  
 */
module.exports = function analyzeStocksPage(pageEnity) {
  return new Promise((resolve) => excutes([], pageEnity, resolve, 0))
}

async function excutes (allStocks, pageEnity, resolve, loopTimes) {
  const url = urlPool[loopTimes]
  await pageEnity.goto(url)
  const content = await pageEnity.content().catch()
  if (content.length) { 
    const rightContext = queryContent(content)
    const stockList = spillStockList(rightContext, getMarketType(url))
    allStocks = allStocks.concat(stockList)
  }
  if (loopTimes === urlPool.length - 1) {
    await pageEnity.close()
    return resolve(allStocks)
  }
  return excutes(allStocks, pageEnity, resolve, ++loopTimes)
}

function getMarketType (url) {
  // http://guba.eastmoney.com/remenba.aspx?type=1&tab=1
  // tab:1 上海
  // tab:2 深圳
  return url.split('tab=').pop()
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
  let loop = stocksTxt.length
  let stockModel = []
  while (loop--) {
    let item = stocksTxt[loop]
    let [stockCode, stockName] = item.split(',')
    // 9或者2开头的股票属于B股，死股，缺乏很多数据，没必要记录
    if (/^[29]/.test(stockCode)) continue
    if (stockCode && stockName) {
      let model = {
        code: stockCode,
        mCode: tabType,
        name: stockName
      }
      stockModel.push(model)
    }
  }
  return stockModel
}
