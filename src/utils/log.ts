import fs from 'fs'
import path from 'path'
import { buildPath } from './build_path'
/**
 * @param { String } msg
 */
const basepath = path.resolve(__dirname + '../../../logs')
export function log(msg: string): void {
  const file = path.join(basepath, global.$finalDealDate + '.log')
  const date = new Date()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const ms = date.getMilliseconds()
  const time = `@${h}:${m}:${s}::${ms}`
  buildPath(file)
  global.$serialThread.call(() => {
    return new Promise((resolve: Function, reject: Function) => {
      try {
        console.log('record: ', msg)
        fs.writeFileSync(file, `${time}\n${msg}\n`)
        return resolve()
      } catch (error) {
        return reject()
      }
    })
  })
}

function test () {
  const { SerialThread } = require('./serial_thread')
  global.$serialThread = new SerialThread()
  global.$finalDealDate = '2022-01-01'
  log('log')
  console.log('console')
}

if (!global.$env) {
  test()
}
