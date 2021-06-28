module.exports = function successModel (res, data) {
  return res.send({
    code: 20000,
    message: 'success',
    data
  })
}
