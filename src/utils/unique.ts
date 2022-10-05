const { isArray, isObject } = require('./assert')
/**
 * 数组去重
 * @param { Array } arrays
 * @return { Array }
 * @template unique([1, 2, 3, 3]) => [1, 2, 3]
 * @template unique([{a: 1}, {a: 1}, {b: 2}]) => [{a: 1}, {b: 2}]
 */
 export function unique<T> (arrays: T[]): T[] {
  if (!isArray(arrays)) return arrays

  let loopIndex = 0
  for (let leftIndex = 0; leftIndex < arrays.length; leftIndex++) {
    loopIndex = arrays.length
    const leftItem = arrays[leftIndex]
    kickout (leftIndex, leftItem, arrays, loopIndex)
  }
  return arrays
}

function kickout (leftIndex: number, leftItem: any, arrays: any[], loopIndex: number): void {
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
