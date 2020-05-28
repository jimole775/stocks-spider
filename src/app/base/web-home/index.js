/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { readFileAsync, batchLink } = require(`${global.srcRoot}/utils`)
const urlModel = readFileAsync(`${global.srcRoot}/url-model.yml`)
export function webHome() {
  batchLink([urlModel.api.date], {
    onResponse: response => {
      console.log(response)
    }
  })
}