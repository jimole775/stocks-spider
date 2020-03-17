/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { readFile, batchLink } = require(`${global.srcRoot}/utils`)
const { getDate } = require('../record-peer-deals/get-date')
const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
const dateReg = new RegExp(urlModel.api.dateReg, 'ig')
export function webHome() {
  batchLink([urlModel.api.date], {
    onResponse: response => {
      console.log(response)
      // if (response.status() === 200 && dateReg.test(response.url())) {
      //   getDate(response)
      // }
    }
  })
}