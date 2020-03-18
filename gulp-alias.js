/*
 * @Author: Rongxis 
 * @Date: 2019-08-17 10:59:54 
 * @Last Modified by:   Rongxis 
 * @Last Modified time: 2019-08-17 10:59:54 
 */

var path = require('path')
var through2 = require('through2')

/**
 * 逻辑很好理解，就是把定义好的别名，在打包之前全部进行替换，替换成绝对路径
 * @param params => { alias:{}, dest:'' }
 */
module.exports = function alias(params) {
  return through2.obj(function (file, encoding, cb) {
    var content = file._contents.toString()
    var alias = params.alias ? params.alias : {}
    var dest = params.dest ? params.dest : ''
    Object.keys(alias).forEach((aliasItem) => {
      var realPath = alias[aliasItem]

      // 判断最后一位字符是不是分隔符，如果不是，就给他加上
      realPath = /[\/\\]$/.test(realPath) ? realPath : realPath + '/'
      dest = /[\/\\]$/.test(dest) ? dest : dest + '/'

      // 动态创建正则
      var a = new RegExp('(\'|\")+' + aliasItem + '(\\\\|\/)+', 'g')

      // 进行全局替换
      content = content.replace(a, '$1' + pathCompatible(path.join(__dirname, dest + realPath)))
    })
    file._contents = Buffer.from(content)
    this.push(file)
    cb && cb()
  })

  function pathCompatible(src) {
    /**
     * 因为path.join()返回的路劲片段分隔符为 '\\'
     * 但是在输出之后，就被转义了一次，变成了 '\'
     * 这种情况下，出现'\b \s' 一类的路径会无法解析
     * 所以在这里统一转成 '/'
     */
    return src.replace(/\\/g, '/')
  }
}