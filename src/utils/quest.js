const http = require('http')
const assert = require('./assert')
const superagent = require('superagent')
const getPathSeparator = require('./get-path-separator')
const { EventEmitter } = require('stream')
/**
 * 伪造随机IP进行接口访问
 * @param { String } url
 * @param { Object } params {method, header}
 * @return { String } 一般以JSON字符串的形式返回数据
 * @template quest('http://xxxxx/xx?xxxx', { method: 'post' }) => '{"message":"success"}'
 */
module.exports = function quest(url, params = {}) {
  const { header = {} } = params
  header['X-Forwarded-For'] = randomIP()
  return new Promise(async (resolve, reject) => {
    let response = {}
    try {
      if (/event-stream/.test(header['Content-Type'])) {
        response = await eventEmitter(url, params)
      } else {
        response = await jsonEmitter(url, params)
      }
      if (response.code === 200) {
        return resolve(response)
      } else {
        return reject(response)
      }
    } catch (error) {
      return reject(error)
    }
  })
}

function jsonHandler (response) {
  let correctData = ''
  if (response.body) {
    if (assert.isObject(response.body) && !assert.isEmptyObject(response.body)) {
      correctData = JSON.stringify(response.body)
    }
    if (assert.isArray(response.body) && !assert.isEmptyArray(response.body)) {
      correctData = JSON.stringify(response.body)
    }
    if (assert.isString(response.body)) {
      correctData = response.body
    }
    if (assert.isBuffer(response.body)) {
      correctData = response.body.toString()
    }
  }
  if (response.text) {
    if (assert.isObject(response.text) && !assert.isEmptyObject(response.text)) {
      correctData = JSON.stringify(response.text)
    }
    if (assert.isArray(response.text) && !assert.isEmptyArray(response.text)) {
      correctData = JSON.stringify(response.text)
    }
    if (assert.isString(response.text)) {
      correctData = response.text
    }
    if (assert.isBuffer(response.text)) {
      correctData = response.text.toString()
    }
  }

  return correctData
}

// function questType (url) {
//   if (/\?/.test(url)) {
//     url = url.split('?').shift()
//   }
//   const pathSeparator = getPathSeparator(url)
//   if (url.split(pathSeparator).pop().includes('.')) {
//     return 'file'
//   } else {
//     return 'json'
//   }
// }

function jsonEmitter (url, { method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    try {
      if (method === 'POST') {
        superagent.post(url).send(data).set(header).then((res) => {
          resolve({
            code: res.status,
            data: jsonHandler(res),
            message: res.info
          })
        })
      } else {
        superagent.get(url).set(header).then((res) => {
          resolve({
            code: res.status,
            data: jsonHandler(res),
            message: res.info
          })
        })
      }
    } catch (error) {
      resolve({
        code: 500,
        data: '',
        message: error
      })
    }
  })
}

function eventEmitter (url, params) {
  return new Promise((resolve, reject) => {
    http.get(url, params, (res) => {
      const finalData = {
        code: res.statusCode,
        data: '',
        message: res.message
      }
      if (finalData.code !== 200) {
       return resolve(finalData)
      }
      res.on('data', (chunk) => {
        const text = chunkToText(chunk)
        if (params.eventTerminal && params.eventTerminal(text)) {
          res.emit('end')
        } else {
          finalData.data += text
        }
      })
      res.on('end', () => {
        resolve(finalData)
      })
    }).on('error', (e) => {
      resolve({
        code: 500,
        data: '',
        message: e.message
      })
    })
  })
}

function randomIP () {
  return 124 + "." + 23
  + "." + Math.round(Math.random() * 254)
  + "." + Math.round(Math.random() * 254)
}

function chunkToText (chunk) {
  let text = ''
  if (assert.isString(chunk)) {
    text += chunk
  }
  if (assert.isBuffer(chunk)) {
    text += chunk.toString()
  }
  return text
}