import { isArray, isObject } from './assert'
export default function (likeArray) {
  if (!isArray(likeArray)) return likeArray
  const newArray = []
  for (let i = 0; i < likeArray.length; i++) {
    const item = likeArray[i]
    let isAlready = false
    let loop = newArray.length
    while(loop --) {
      const newItem = newArray[loop]
      const _old = isObject(item) ? Object.entries(item).toString() : item
      const _new = isObject(item) ? Object.entries(newItem).toString() : newItem
      if (_new === _old) {
        isAlready = true
        break
      }
    }
    if (isAlready) continue
    else newArray.push(item)
  }
  return newArray
}
