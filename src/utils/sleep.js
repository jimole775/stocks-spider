module.exports = sleep (time) {
  return new Promise(s => setTimeout(s, time))
}
