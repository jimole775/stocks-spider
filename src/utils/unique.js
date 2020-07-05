const { isArray, isObject } = require('./assert')
/**
* 
* @param { Array } arrays
* @return { Array }
* @template unique([1, 2, 3, 3]) => [1, 2, 3]
* @template unique([{a: 1}, {a: 1}, {b: 2}]) => [{a: 1}, {b: 2}]
*/
module.exports = function unique (arrays) {
  if (!isArray(arrays)) return arrays

  let loopIndex = 0
  for (let leftIndex = 0; leftIndex < arrays.length; leftIndex++) {
    loopIndex = arrays.length
    const leftItem = arrays[leftIndex]
    kickout (leftIndex, leftItem, arrays, loopIndex)
  }
  return arrays
}

function kickout (leftIndex, leftItem, arrays, loopIndex) {
  while(loopIndex > leftIndex) {
    let rightItem = arrays[loopIndex]
    leftItem = isObject(leftItem) ? Object.entries(leftItem).toString() : leftItem
    rightItem = isObject(rightItem) ? Object.entries(rightItem).toString() : rightItem

    if (leftItem === rightItem) {
      arrays.splice(loopIndex, 1)
      return kickout(leftIndex, leftItem, arrays, loopIndex -= 1)
    }

    loopIndex -= 1
  }
}