export default function queryParam (getKey?: string) {
  const res: { [key: string]: string } = {}
  if (process.argv && process.argv.length) {
    process.argv.forEach((item) => {
      if (item && /^\-\-.+/.test(item)) {
        const [key, value] = item.replace(/\-\-/, '').split('=')
        res[key] = value
      }
    })
  }
  return getKey ? res[getKey] : res
}
