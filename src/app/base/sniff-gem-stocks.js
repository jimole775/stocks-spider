/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:27
 */
/**
 * 过滤掉创业板的股票
 */
const puppeteer = require('puppeteer')
const url = global.urlModel.api.GemBoardList
function init() {
	return new Promise(async (s, j) => {
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await getGemStocks(page)
		s('SpillStockModel init success')
	})
}

/**
 * 
 * @return [{ code:'', name:'' }]  
 */
function getGemStocks(page) {
	return new Promise(async (s, j) => {
		await page.goto(url)
		const content = await page.content()
		if (content.length) {
			let dataString = content.match(/\(\{.+\}\)/ig)[0]
			dataString = dataString.replace(/f12/ig, 'code').replace(/f14/ig, 'name')
			const { data: { diff } } = dataString && eval(dataString)
			s(diff)
		} else {
			console.log('加载失败:', url)
			j('加载失败:', url)
		}
		page.close()
	})
}

function queryGemStocks(allStocks) {
	return new Promise(async (s, j) => {
		const gemStocks = await getGemStocks()
		let gemStocksLoop = gemStocks.length
		while (gemStocksLoop--) {
			const gemStocksItem = gemStocks[gemStocksLoop]
			allStocks.forEach((stock, index) => {
				if (stock.code == gemStocksItem['code']) {
					allStocks.splice(index, 1)
				}
			})
		}
		s(allStocks)
	})
}
