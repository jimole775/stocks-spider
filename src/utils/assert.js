module.exports = {
  isArray (likeArray) {
    return Object.prototype.toString.call(likeArray) === '[object Array]'       
  },

  isEmptyArray (likeArray) {
    return isArray(likeArray) && likeArray.length === 0    
  },

  isObject(likeObject) {
    return Object.prototype.toString.call(likeObject) === '[object Object]'
  },

  isFunction(likeFunction) {
    return Object.prototype.toString.call(likeFunction) === '[object Function]'            
  },

  isNumber(likeNumber) {
    return Object.prototype.toString.call(likeNumber) === '[object Number]'            
  },

  isEmptyObject(likeObject) {
    return Object.prototype.toString.call(likeObject) === '[object Object]' && Object.keys(likeObject).length === 0    
  },

  isString(likeString) {
    return Object.prototype.toString.call(likeString) === '[object String]'    
  },

  isBuffer(likeBuffer) {
    return [
      '[object ArrayBuffer]',
      '[object Buffer]',
      '[object Uint8Array]',
      '[object Uint16Array]',
      '[object Uint32Array]'
    ].includes(Object.prototype.toString.call(likeBuffer))
  },

  isNone(src) {
    return src === undefined || src === null || src === ''
  },

  isValuable (src) {
    return src !== undefined && src !== null && src !== ''
  },

  isImgUrl(src) {
    return /(\.png|jpe?g|gif|icon|svg)\??.*/i.test(src)
  },

  isHTMLUrl(src) {
    return /\.(s?html?)(\?.+)?$/.test(src)
  },

  isCSSUrl(src) {
    return /\.(sass|css|less)(\?.+)?$/.test(src)
  },

  isJSUrl(src) {
    return /\.(js)(\?.+)?$/.test(src)
  },

  rangeEqual(a = 0, b = 0, range = 0) {
    return a >= b && a <= b * (1 + range) || a <= b && a * (1 + range) >= b
  }
}
