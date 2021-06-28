module.exports = function failModel (res, err) {
  return res.send({
    code: 40000,
    message: err,
    data: {}
  })
}
