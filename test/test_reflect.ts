import { waitBy } from "../src/utils/wait_by"
const main = {
  queue: [{ sign: false }, { sign: false }, { sign: false }],
  test: async function test () {
    setTimeout(() => {
      this.queue.forEach(i => i.sign = true)
    }, 1500)
    const condition = () => {
      const fined = this.queue.find(i => i.sign === false)
      return fined === undefined
    }
    await waitBy(condition)
  }
}

main.test()
