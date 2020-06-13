module.exports = function sleep (time = 1000) {
  return new Promise(s => setTimeout(s, time))
}
