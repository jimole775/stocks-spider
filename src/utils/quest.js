
const superagent = require('superagent')
/**
 * 
 * @param {*} url 
 * @param {*} params 
 * @return String
 */
export default function (url, params) {
  return new Promise(async (s, j) => {
    const ip = Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
    let response = null
    if (params && params.method && params.method.toUpperCase === 'POST') {
      response = await superagent.post(url).send(params.data).set('X-Forwarded-For', ip).catch(err => j(err))
    } else {
      response = await superagent.get(url).set('X-Forwarded-For', ip).catch(err => j(err))
    }
  
    if (response.status === 200) {
      // response.body 是 Buffer
      s(response.body ? response.body.toString() : '')
    } else {
      j(response.info)
    }
  })
}