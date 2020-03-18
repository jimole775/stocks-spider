/*
 * @Author: Rongxis 
 * @Date: 2019-08-17 10:59:54 
 * @Last Modified by:   Rongxis 
 * @Last Modified time: 2019-08-17 10:59:54 
 */
var through2 = require('through2')

/**
 * 直接通过【修改文本】的方式，在资源的【入口文件】内，写入 global 对象
 */
module.exports = function inject(globalVars) {
  return through2.obj(function(file, encoding, cb){
    if (file.path) {
      var content = file._contents.toString()
      Object.keys(globalVars).forEach((field)=>{
        var reg = new RegExp('\'#inject global vars#\'', 'g')
        if (Object.prototype.toString.call(globalVars[field]) === '[object Object]') {
          content = content.replace(reg, 'global.' + field + ' = ' + pathCompatible(JSON.stringify(globalVars[field])) + ';\r\n\'#inject global vars#\'')
        } else {
          content = content.replace(reg, 'global.' + field + ' = \'' + pathCompatible(globalVars[field]) + '\';\r\n\'#inject global vars#\'')
        }
      })
      file._contents = Buffer.from(content)
    }
    this.push(file)
    cb && cb()
  })
  
  /**
   * 由于写入global对象的时候，import 语法会提前加载外部模块， 所以要把 import 换为 require
   * @param {*} content 
   */
  function transformModuleType(content) {
    // var b = new RegExp('import ', 'g')
    var a = new RegExp('import (.*?) from \'(.*?)\'', 'g')
    var b = new RegExp('import \'(.*?)\'', 'g')
    // content = content.replace(b, 'const ')
    content = content.replace(a, 'const $1 = require(\'$2\')')
    content = content.replace(b, 'require(\'$1\')')
    return content
  }

  /**
   * 因为path.join()返回的路劲片段分隔符为 '\\'
   * 但是在输出之后，就被转义了一次，变成了 '\'
   * 这种情况下，出现'\b \s' 一类的路径会无法解析
   * 所以在这里统一转成 '/'
   */
  function pathCompatible(src){
    return encodeURL(src.replace(/\\/g, '/'))
  }

  /**
   * '/' 转换成 '\/' ，让字串在计算的时候，转译一次，得到一个正确的路径
   */
  function encodeURL(src) {
    return src.replace(/\//g, '\\\/')
  }
}