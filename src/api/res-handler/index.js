const failure = require('./failure.js')
const error = require('./error.js')
const success = require('./success.js')
module.exports = function resHandler (fn) {
  return async (req, res) => {
    try {
      const data = await fn(req, res)
      if (typeof data === 'string') {
        return failure(res, data)
      } else {
        return success(res, data)
      }
    } catch (err) {
      return error(res, err)
    }
  }
}