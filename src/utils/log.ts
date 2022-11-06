import fs from 'fs'
import path from 'path'
import { buildPath } from './build_path'
import { Thread } from './thread'
/**
 * @param { String } msg
 */
const basepath = path.resolve(__dirname + '../../../logs')
const logThread = new Thread(1)
export function log(...args: any[]): void {
  const file = path.join(basepath, global.$finalDealDate + '.log')
  const date = new Date()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const hh = h < 10 ? `0${h}` : h
  const mm = m < 10 ? `0${m}` : m
  const ss = s < 10 ? `0${s}` : s
  const ms = date.getMilliseconds()
  const time = `@${hh}:${mm}:${ss}::${ms}`
  buildPath(file)
  logThread.call(() => {
    return new Promise((resolve: Function, reject: Function) => {
      try {
        const content = `${time}\n${args.join('')}\n` 
        fs.appendFileSync(file, content)
        return resolve()
      } catch (error) {
        return reject()
      }
    })
  })
}

function test () {
  global.$finalDealDate = '2022-01-01'
  log('log', 11, 22)
  console.log('console')
}

if (!global.$env) {
  test()
}
