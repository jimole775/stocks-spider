const assert = require('./assert')
/**
 * 深克隆
 * @param { Object | Array<any> } srcobject
 * @param { String } attrName 额外插入的属性名
 * @param { any } value 额外插入的属性值
 * @return { Object | Array<any> }
 * @template clone({...}) => {...}
 * @template clone([...]) => [...]
 * @template clone({...}, a, 1) => {..., a: 1}
 */
module.exports = function clone (srcobject, attrName, value) {
  let newobject = null
  if (assert.isArray(srcobject)) {
    newobject = []
    objPropsTteration(srcobject, newobject)
    // 数组类型，第二个参数必须是数字
    if (assert.isNumber(attrName)) {
      const index = attrName
      newobject[index] = value
    }
  }
  if (assert.isObject(srcobject)) {
    newobject = {}
    objPropsTteration(srcobject, newobject)
    // 对象类型，第二个参数必须是有效的字符串
    if (assert.isValuable(attrName) && assert.isString(attrName)) {
      newobject[attrName] = value
    }
  }

  return newobject || srcobject
}

function objPropsTteration () {
  const isTop = arguments.length === 2
  const [src, res, pkey] = arguments
  if (assert.isObject(src)) {
    if (!isTop) res[pkey] = {}
    return Object.keys(src).forEach((ckey) => {
      return objPropsTteration(src[ckey], isTop ? res : res[pkey], ckey)
    })
  }
  if (assert.isArray(src)) {
    if (!isTop) res[pkey] = []
    return src.forEach((item, index) => {
      return objPropsTteration(item, isTop ? res : res[pkey], index)
    })
  }
  res[pkey] = src
}
