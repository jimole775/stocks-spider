
import superagent from 'superagent'
/**
 * 
 * @param url 
 * @param {method, header} 
 * @return String
 */
export function quest(url, { method = 'POST', header = {} }) {
  return new Promise(async (s, j) => {
    const ip = Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
        + "." + Math.random(1 , 254)  
    let response = null
    if (method.toUpperCase === 'POST') {
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
      return s(response.body ? response.body.toString() : '')
    } else {
      return j(response.info)
    }
  })
}

function questType (url) {
  url = url.split('?')
}

function questFile () {

}

function questJson () {

}
