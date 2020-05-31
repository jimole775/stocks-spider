module.exports = function getPathSeparator(path) {
  return path.includes('\/') ? '\/' : path.includes('\\\\') ? '\\\\' : '\\'
}