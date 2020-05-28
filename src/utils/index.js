import { 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl,
  rangeEqual/*约等于运算*/
} from './assert'
import { StepFlow } from './step-flow' // 同步流程
import { hasRefreshLinks } from './has-refresh-links'  // 从已采集的库里筛选出过期数据
import { getPathSeparator } from './get-path-separator'  // 获取路径分隔符
import { buildPath } from './build-path' // 创建多级路径
import { hasUninks } from './has-unlinks' // 从已采集的库筛选出未访问的URL
import { dateFormat } from './date-format'
import { writeFileAsync } from './write-file-async'
import { Link } from './link' // 
import { BunchLinks } from './bunch-links' // 多线程形式批量采访链接
import { initPage } from './init-page' // batchLink的依赖函数
import { readFileAsync } from './read-file-async'
import { getDate } from './get-date' // 从默认站点，采集最后交易日的时间
import { unique } from './unique' // 去重
import { quest } from './quest' // superagent的封装
import { removeDir } from './remove-dir' // 
export {
  readFileAsync, writeFileAsync, quest, 
  isArray, isEmptyArray, isObject, removeDir,
  isEmptyObject, isString, isEmpty, unique, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl, initPage,
  Link, getDate, hasUninks, hasRefreshLinks, dateFormat,
  rangeEqual, getPathSeparator, buildPath, StepFlow, BunchLinks
}
