import { 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl 
} from './assert'
import writeFile from './write-file'
import batchLink from './batch-link'
import initPage from './init-page'
import readFile from './read-file'
import unique from './unique'
import quest from './quest'
export {
  readFile, writeFile, quest, 
  isArray, isEmptyArray, isObject, 
  isEmptyObject, isString, isEmpty, unique, 
  isImgUrl, isHTMLUrl, isCSSUrl, isJSUrl, initPage,
  batchLink
}