// import path from 'path'
// import readDirSync from './read_dir_sync'
// const utilDir: string = path.join(__dirname, './')
// const utilFiles: string[] = readDirSync(utilDir)
// const res: { [key: string]: Function | object } = {}
// utilFiles.forEach((file) => {
//   if (/^index\.+/.test(file)) return false
//   const fn: Function | object = require(path.join(utilDir, file))
//   if (isFunction(<Function>fn)) {
//     res[(fn as Function).name] = fn
//   }
//   if (isObject(<Object>fn)) {
//     const obj = fn as {[key: string]: object}
//     Object.keys(obj).forEach((key) => {
//       res[key] = obj[key]
//     })
//   }
// })

// function isObject(likeObject: object): boolean {
//   return Object.prototype.toString.call(likeObject) === '[object Object]'
// }

// function isFunction(likeFunction: Function): boolean {
//   return Object.prototype.toString.call(likeFunction) === '[object Function]'            
// }
export { Util } from '@/types/util.d'
export * from './assert'
export * from './build_path'
export * from './bunch_linking'
export * from './bunch_thread'
export * from './cmd_param'
export * from './diffrence'
export * from './get_path_separator'
export * from './has_refresh_links'
export * from './has_unlinked'
export * from './link'
export * from './quest'
export * from './read_dir_sync'
export * from './read_file_sync'
export * from './record_used_api'
export * from './remove_dir'
export * from './remove_sibling_dir'
export * from './request_api_in_bunch'
export * from './sleep'
export * from './stock_connect'
export * from './to_money'
export * from './unique'
export * from './write_file_sync'
