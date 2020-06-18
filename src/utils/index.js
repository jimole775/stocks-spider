const { 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl,
  rangeEqual/*约等于运算*/
} = require('./assert')
const hasRefreshLinks = require('./has-refresh-links')  // 从已采集的库里筛选出过期数据
const getPathSeparator = require('./get-path-separator')  // 获取路径分隔符
const removeSiblingDir = require('./remove-sibling-dir')  // 
const buildPath = require('./build-path') // 创建多级路径
const hasUninks = require('./has-unlinks') // 从已采集的库筛选出未访问的URL
const dateFormat = require('./date-format')
const writeFileSync = require('./write-file-sync')
const recordUsedApi = require('./record-used-api')
const BunchThread = require('./bunch-thread')
const moneyFormat = require('./money-format')
const Link = require('./link') // 
const BunchLinking = require('./bunch-linking') // 多线程形式批量采访链接
const hasFullRecordInbaseData = require('./has-full-record-in-base-data') // 多线程形式批量采访链接
const initPage = require('./init-page') // batchLink的依赖函数
const readFileSync = require('./read-file-sync')
// const getDate = require('../get-date') // 从默认站点，采集最后交易日的时间
const unique = require('./unique') // 去重
const quest = require('./quest') // superagent的封装
const sleep = require('./sleep') // 睡眠装置
const removeDir = require('./remove-dir') // 
module.exports = {
  readFileSync, writeFileSync, quest, 
  isArray, isEmptyArray, isObject, removeDir,
  isEmptyObject, isString, isEmpty, unique, removeSiblingDir,
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl, initPage, sleep, BunchThread,
  Link, hasUninks, hasRefreshLinks, dateFormat, recordUsedApi, moneyFormat,
  rangeEqual, getPathSeparator, buildPath, BunchLinking, hasFullRecordInbaseData
}
