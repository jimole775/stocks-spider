/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
const { quest } = require(`${global.srcRoot}/utils`)
export async function getDate(response) {
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  const dirtyData = await quest(response.url(), { 
    method: response._request._method,
    data: response._request._postData,
  })
  console.log(dirtyData)
}