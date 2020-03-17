import fs from 'fs'
import path from 'path'
import { isArray, isObject } from './assert'
export default function (file, data) {
  let fd = null
  try {
    const isExist = fs.existsSync(file)
    if (!isExist) createPath(file)
    if (isArray(data) || isObject(data)) {
      data = JSON.stringify(data)
    } 
    fd = fs.writeFileSync(file, data, 'utf8')
  } catch (error) {
    console.log('writeFile:', error)
    fd = null
  }
  return fd
}

function createPath(file) {
  debugger
  const splitMark = getSplitMark(file)
  const delimArr = file.split(splitMark)
  delimArr.pop()
  const filePath = delimArr.join(splitMark)
  const isDirExist = fs.existsSync(filePath)
  if (!isDirExist) fs.mkdirSync(filePath)
}

function getSplitMark(file) {
  return file.includes('\/') ? '\/' : file.includes('\\\\') ? '\\\\' : '\\'
}