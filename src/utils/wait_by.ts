export async function waitBy (condition: () => Promise<any> | any, delay?: number): Promise<any> {
  const loopEntity = async (loopResolve: Function): Promise<any> => {
    const expection = await condition()
    if (expection) {
      return loopResolve(expection)
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
