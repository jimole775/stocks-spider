module.exports = function queryParam (getKey) {
  const res = {}
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
