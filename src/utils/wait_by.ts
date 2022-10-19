export async function waitBy (condition: () => Promise<boolean> | boolean, delay?: number): Promise<any> {
  const loopEntity = async (loopResolve: Function): Promise<any> => {
    if (await condition()) {
      return loopResolve()
    } else {
      return setTimeout(() => {
        return loopEntity(loopResolve)
      }, delay || 500)
    }
  }
  return new Promise((resolve: Function) => {
    return loopEntity(resolve)
  })
}
