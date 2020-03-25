export function getPathSeparator(path) {
  return path.includes('\/') ? '\/' : path.includes('\\\\') ? '\\\\' : '\\'
}