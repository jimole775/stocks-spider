import { 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl 
} from './assert'
import { hasRefreshLinks } from './has-refresh-links'
import { hasUninks } from './has-unlinks'
import { dateFormat } from './date-format'
import { writeFile } from './write-file'
import { batchLink } from './batch-link'
import { initPage } from './init-page'
import { readFile } from './read-file'
import { getDate } from './get-date'
import { unique } from './unique'
import { quest } from './quest'
export {
  readFile, writeFile, quest, 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, unique, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl, initPage,
  batchLink, getDate, hasUninks, hasRefreshLinks, dateFormat
}
