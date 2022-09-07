/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:26
 */
import moment from 'moment'
import puppeteer, { Page } from 'puppeteer'
import analyzeStocksPage from './analyze_stocks_page'
import { BaseDataStructure, BaseData } from '@/types/stock'
const { readFileSync, writeFileSync } = global.$utils

export default function buildBaseData (): Promise<BaseDataStructure> {
  return new Promise(excutes)
}

async function excutes (resolve: Function, reject: Function) {
  const alreadyData: BaseDataStructure = readFileSync(global.$path.db.base_data)
  const expired: boolean = hasExpired(alreadyData)
  // 数据没过期，就使用已有的数据
  if (!expired) return resolve()
  // 数据过期了，就重新爬取
  try {
    const browser = await puppeteer.launch().catch()
    const pageEnity: Page = await browser.newPage().catch()
    const allStocks: BaseData = await analyzeStocksPage(pageEnity)
    const baseData: BaseDataStructure = {
      date: new Date().getTime(),
      // 我们刷新数据，最多就是为了刷新name这个字段（很多股票ST后，名字会变）
      // 其他一些数据需要保留，类似“dealApi”之类的
      data: alreadyData ? merge(alreadyData, allStocks) : allStocks
    }
    writeFileSync(global.$path.db.base_data, baseData)
    return resolve(baseData)
  } catch (error) {
    console.error('build model error:', error)
    return reject(error)
  }
}

function merge (alreadyData: BaseDataStructure, newItems: BaseData): BaseData {
  const res: BaseData = []
  alreadyData.data.forEach((oldItem) => {
    for (let j = 0; j < newItems.length; j++) {
      const newItem = newItems[j]
      if (newItem.code === oldItem.code) {
        res.push({
          ...oldItem,
          name: newItem.name
        })
        newItems.splice(j, 1)
        break
      }
    }
  })
  return res.concat(newItems)
}

function hasExpired (alreadyData: BaseDataStructure): boolean {
  // 数据库没有原始数据，就当作过期处理
  if (!alreadyData) return true
  let expired = false
  // 如果现实时间和global.$finalDealDate相同，则证明是非假日或者周末
  // 这样可以用24小时论做判断
  const reality = moment(new Date()).format('YYYY-MM-DD')
  if (reality !== global.$finalDealDate) {
    expired = true
  }
  return expired
}

function isOverOneDay (alreadyDate: number): boolean {
  return new Date().getTime() - new Date(alreadyDate).getTime() >= 24 * 60 * 60 * 1000
}
