import { Page } from "puppeteer"
import { BaseData } from "@/types/stock"
/**
 * 
 */
export default function analyzeStocksPage(pageEnity: Page): Promise<BaseData> {
  return new Promise((resolve) => excutes([], pageEnity, resolve, 0))
}

async function excutes (allStocks: BaseData, pageEnity: Page, resolve: Function, loopTimes: number): Promise<BaseData> {
  const urlPool = [
    global.$urlModel.page.SHStockList,
    global.$urlModel.page.SZStockList
  ]
  const url = urlPool[loopTimes]
  await pageEnity.goto(url)
  const content = await pageEnity.content().catch()
  if (content.length) {
    const rightContext = queryContent(content)
    const stockList: BaseData = spillStockList(rightContext, getMarketType(url))
    allStocks = [ ...allStocks, ...stockList]
  }
  if (loopTimes === urlPool.length - 1) {
    await pageEnity.close()
    return resolve(allStocks)
  }
  return excutes(allStocks, pageEnity, resolve, ++loopTimes)
}

function getMarketType (url: string): string {
  // http://guba.eastmoney.com/remenba.aspx?type=1&tab=1
  // tab:1 上海
  // tab:2 深圳
  return url.split('tab=').pop() || '0'
}

function queryContent(htmlStr: string): string[] {
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
    return []
  }
}

function spillStockList(stocksTxt: string[], tabType: string): BaseData  {
  let loop = stocksTxt.length
  let stockModels: BaseData = []
  while (loop--) {
    let item = stocksTxt[loop]
    let [stockCode, stockName] = item.split(',')
    // 9或者2开头的股票属于B股，死股，缺乏很多数据，没必要记录
    if (/^[29]/.test(stockCode)) continue
    if (stockCode && stockName) {
      let model = {
        code: stockCode,
        mCode: Number(tabType),
        name: stockName
      }
      stockModels.push(model)
    }
  }
  return stockModels
}
