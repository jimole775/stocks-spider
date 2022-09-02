export function isDate (src: any) {
  return isString(src) &&
    (
      /^\d{4}([-/\\]\d{2}([-/\\]\d{2}( \d{2}:\d{2}:\d{2})?)?)?$/.test(src) ||
      /^\d{2}(:\d{2}(:\d{2})?)?$/.test(src)
    )
}

export function isArray (likeArray: any): boolean {
  return Object.prototype.toString.call(likeArray) === '[object Array]'
}

export function isEmptyArray (likeArray: any): boolean {
  return isArray(likeArray) && likeArray.length === 0
}

export function isObject(likeObject: any): boolean {
  return Object.prototype.toString.call(likeObject) === '[object Object]'
}

export function isFunction(likeFunction: any): boolean {
  return Object.prototype.toString.call(likeFunction) === '[object Function]'
}

export function isNumber(likeNumber: any): boolean {
  return Object.prototype.toString.call(likeNumber) === '[object Number]'
}

export function isEmptyObject(likeObject: any): boolean {
  return Object.prototype.toString.call(likeObject) === '[object Object]' && Object.keys(likeObject).length === 0
}

export function isString(likeString: any): boolean {
  return Object.prototype.toString.call(likeString) === '[object String]'
}

export function isBuffer(likeBuffer: any): boolean {
  return [
    '[object ArrayBuffer]',
    '[object Buffer]',
    '[object Uint8Array]',
    '[object Uint16Array]',
    '[object Uint32Array]'
  ].includes(Object.prototype.toString.call(likeBuffer))
}

export function isNone(src: any): boolean {
  return src === undefined || src === null || src === ''
}

export function isValuable (src: any): boolean {
  return src !== undefined && src !== null && src !== ''
}

export function isImgUrl(src: any): boolean {
  return /(\.png|jpe?g|gif|icon|svg)\??.*/i.test(src)
}

export function isHTMLUrl(src: any): boolean {
  return /\.(s?html?)(\?.+)?$/.test(src)
}

export function isCSSUrl(src: any): boolean {
  return /\.(sass|css|less)(\?.+)?$/.test(src)
}

export function isJSUrl(src: any): boolean {
  return /\.(js)(\?.+)?$/.test(src)
}

export function rangeEqual(a: number = 0, b: number = 0, range: number = 0): boolean {
  return a >= b && a <= b * (1 + range) || a <= b && a * (1 + range) >= b
}
