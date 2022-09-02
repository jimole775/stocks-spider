import { Page } from 'puppeteer'
export type Page = Page

export type CustomObject = {[key: string]: any}
export type StringObject = {[key: string]: string}
export type NumberObject = {[key: string]: number}
export type FunctionObject = {[key: string]: Function}
export type TreeObject = {[key: string]: TreeObject | CustomObject}
export type StockResponse = {code: number, data: any, message: string}