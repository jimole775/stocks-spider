import fs from 'fs'
import path from 'path'
import { isArray, isObject } from './assert'
export function writeFile(asbFilePath, data) {
  let fd = null
  try {
    const splitMark = getSplitMark(asbFilePath)
    const pathArr = asbFilePath.split(splitMark)
    const isExist = fs.existsSync(asbFilePath)
    if (!isExist) createPath(pathArr)
    if (isArray(data) || isObject(data)) {
      data = JSON.stringify(data)
    } 
    fd = fs.writeFileSync(asbFilePath, data, 'utf8')
  } catch (error) {
    console.log('writeFile:', error)
    fd = null
  }
  return fd
}

function createPath(pathArr) {
  // delimArr.pop()
  for (const path of pathArr) {
    const isDirExist = fs.existsSync(path)
    if (!isDirExist) fs.mkdirSync(prevPath)
  }
}

function getSplitMark(asbFilePath) {
  return asbFilePath.includes('\/') ? '\/' : asbFilePath.includes('\\\\') ? '\\\\' : '\\'
}