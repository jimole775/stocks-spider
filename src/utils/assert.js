export function isArray(likeArray) {
  return Object.prototype.toString.call(likeArray) === '[object Array]'            
}

export function isEmptyArray(likeArray) {
  return isArray(likeArray) && likeArray.length === 0    
}

export function isObject(likeObject) {
  return Object.prototype.toString.call(likeObject) === '[object Object]'            
}

export function isEmptyObject(likeObject) {
  return isObject(likeObject) && Object.keys(likeObject).length === 0    
}

export function isString(likeString) {
  return Object.prototype.toString.call(likeString) === '[object String]'    
}

export function isEmpty(likeEmpty) {
  return likeEmpty === undefined || likeEmpty === null || likeEmpty === ''
}

export function isImgUrl(src) {
  return /(\.png|jpe?g|gif|icon|svg)\??.*/i.test(src)
}

export function isHTMLUrl(src) {
  return /\.(s?html?)(\?.+)?$/.test(src)
}

export function isCSSUrl(src) {
  return /\.(sass|css|less)(\?.+)?$/.test(src)
}

export function isJSUrl(src) {
  return /\.(js)(\?.+)?$/.test(src)
}