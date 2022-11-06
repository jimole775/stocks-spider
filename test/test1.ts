async function test () {
  const array = create(10)
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    console.log('sta', index)
    await element()
    console.log('end', index)
  }
}

function create (len: number): Function[] {
  const res: Function[] = []
  for (let index = 0; index < len; index++) {
    const fun = () => {
      return new Promise((resolve: Function) => setTimeout(() => {
        resolve()
      }, Math.random() * 2000))
    }
    res.push(fun)
  }
  return res
}

test()
