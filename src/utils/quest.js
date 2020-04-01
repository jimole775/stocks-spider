
import superagent from 'superagent'
import { getPathSeparator } from './get-path-separator'
/**
 * 
 * @param url 
 * @param {method, header} 
 * @return String
 */
export function quest(url, params = {}) {
  const { method = 'GET', header = {}} = params
  return new Promise(async (s, j) => {
    const ip = 124 + "." + 23
        + "." + Math.round(Math.random() * 254)
        + "." + Math.round(Math.random() * 254)
    let response = {}
    if (method === 'POST') {
      response = await superagent.post(url).send(params.data).set({
        'X-Forwarded-For': ip,
        ...header
      }).catch(err => j(err))
    } else {
      response = await superagent.get(url).set({
        'X-Forwarded-For': ip,
        ...header
      }).catch(err => j(err))
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

