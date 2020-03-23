import { 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl 
} from './assert'
import { hasRefreshLinks } from './has-refresh-links'  // 从已采集的库里筛选出过期数据
import { hasUninks } from './has-unlinks' // 从已采集的库筛选出未访问的URL
import { rangeEqual } from './range-equal' // 约等于运算
import { dateFormat } from './date-format'
import { writeFile } from './write-file'
import { batchLink } from './batch-link' // 单线程形式批量采访链接
import { initPage } from './init-page' // batchLink的依赖函数
import { readFile } from './read-file'
import { getDate } from './get-date' // 从默认站点，采集最后交易日的时间
import { unique } from './unique' // 去重
import { quest } from './quest' // superagent的封装
export {
  readFile, writeFile, quest, 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, unique, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl, initPage,
  batchLink, getDate, hasUninks, hasRefreshLinks, dateFormat,
  rangeEqual
}
