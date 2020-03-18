import puppeteer from 'puppeteer'
import {isCSSUrl, isImgUrl} from './assert'
export function initPage(requestCallback, responseCallback) {
  return new Promise(async (s, j) => {
    try {
      const browser = await puppeteer.launch().catch()
      const page = await browser.newPage().catch()
      await page.setRequestInterception(true).catch()
      page.on('request', interceptedRequest => {
        if ( isImgUrl(interceptedRequest.url()) || isCSSUrl(interceptedRequest.url())) {
          interceptedRequest.abort()
        } else {
          interceptedRequest.continue()
        }
        requestCallback && requestCallback(interceptedRequest)
      })
      if (responseCallback) {
        page.on('response', response => {
          responseCallback(response)
        })
      }
      return s(page)
    } catch (error) {
      return j('open-page error', error)
    }
  }).catch(function (error) {
    console.error('open-page error:', error)
  })
}