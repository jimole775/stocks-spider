import { waitBy } from '../src/utils/wait_by'
import { sleep } from '../src/utils/sleep'

(async () => {
  console.log('waiting')
  await waitBy(async () => {
    await sleep(2000)
    return Promise.resolve(true)
  })
  console.log('got it')
})()
