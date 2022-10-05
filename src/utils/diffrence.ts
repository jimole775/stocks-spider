/**
 * @param { Object | Array } src
 * @param { Array | String | Number } eliminateItems
 * @return { Object | Array }
 * @template diffrence([1, 2], 1) => [2]
 * @template diffrence([1, 2], [2, 3]) => [1]
 * @template diffrence({ a: 1, b: 2 }, { a: 1 }) => { b: 2 }
 * @template diffrence([{ a: 1}, { b: 2 }], { a: 1 }) => [{ b: 2 }]
 * @template diffrence([{ a: 1}, { b: 2 }, { c: 3 }], [{ a: 1 }, { b: 2 }]) => [{ c: 3 }]
 */
import { isArray, isObject, isString, isNumber } from './assert'
export function diffrence (src: any, eliminateItems: any): any | null {
  if (isString(eliminateItems) || isNumber(eliminateItems)) eliminateItems = [eliminateItems]
  if (isArray(src) && isObject(eliminateItems)) eliminateItems = [eliminateItems]

  if (isString(src) || isNumber(src)) return src
  if (isArray(src) && !isArray(eliminateItems)) return src
  if (isObject(src) && !isObject(eliminateItems)) return src

  let result:any = null
  if (isArray(src)) {
    result = []
    for (let index = 0; index < src.length; index++) {
      const element = src[index]
      let already = false
      if (eliminateItems.includes(element)) {
        already = true
      }
      if (!already) {
        result.push(element)
      }
    }
  }

  if (isObject(src)) {
    result = {}
    Object.keys(src).forEach((key) => {
      let already = false
      if (key in eliminateItems) {
        already = true
      }
      if (!already) {
        result[key] = src[key]
      }
    })
  }

  return result
}
