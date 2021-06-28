
const superagent = require('superagent')
const getPathSeparator = require('./get-path-separator')
/**
 * 伪造随机IP进行接口访问
 * @param { String } url
 * @param { Object } params {method, header}
 * @return { String } 一般以JSON字符串的形式返回数据
 * @template quest('http://xxxxx/xx?xxxx', { method: 'post' }) => '{"message":"success"}'
 */
module.exports = function quest(url, params = {}) {
  const { method = 'GET', header = {}} = params
  return new Promise(async (s, j) => {
    const ip = 124 + "." + 23
        + "." + Math.round(Math.random() * 254)
        + "." + Math.round(Math.random() * 254)
    let response = {}
    try {
      if (method === 'POST') {
        response = await superagent.post(url).send(params.data).set({
          'X-Forwarded-For': ip,
          ...header
        })
      } else {
        response = await superagent.get(url).set({
          'X-Forwarded-For': ip,
          ...header
        })
      }
      if (response.status === 200) {
        // response.body 是 Buffer
        if (questType (url) === 'json') {
          return s(response.body ? response.body.toString() : '')
        } else if (questType (url) === 'file') {
          return s(response.text ? response.text.toString() : '')
        } else {
          return s(response.body ? response.body.toString() : '')
        }
      } else {
        return j(response.info)
      }
    } catch (error) {
      return j(response.info)
    }
  })
}

function questType (url) {
  if (/\?/.test(url)) {
    url = url.split('?').shift()
  }
  const pathSeparator = getPathSeparator(url)
  if (url.split(pathSeparator).pop().includes('.')) {
    return 'file'
  } else {
    return 'json'
  }
}
