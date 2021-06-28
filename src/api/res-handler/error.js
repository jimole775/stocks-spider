module.exports = function errorModel (res, err) {
  return res.send({
    code: 50000,
    message: err,
    data: {}
  })
}
