global.srcRoot = __dirname
global.baseUrl = 'src'
global.bunchLimit = 3
global.finalDealDate = null
global.crossEnv = queryParam()

function queryParam () {
  const res = {}
  let [param = null] = process.argv.pop()
  if (param && /^\-\-.+/.test(param)) {
    param = param.replace(/\-\-/, '')
    param = param.split('=')
    res[param[0]] = param[1]
  }
  return res
}