const { readFileSync } = require("F:\\pro_javascript\\stocks\\src\\utils\\read_file_sync.ts")

const date = '2022-11-16'

const log = require('path').resolve(__dirname, `../logs/${date}.log`)

const content = readFileSync(log)
const arr = content.split('\n')
const arr1 = arr.filter((t: string) => /http:/.test(t)).map((t: string) => t.replace(/page ((open|end):_id_(\d{1,}))h.+/, '$2,$3'))
type stateOption = { open: number, end: number }
const state: {[type: string]: stateOption} = {}

arr1.forEach((item: string) => {
  const [type, id] = item.split(',')
  !state[id] && (state[id] = {open: 0, end: 0})
  state[id][type as keyof stateOption] = state[id][type as keyof stateOption] + 1
})
console.log(state)
