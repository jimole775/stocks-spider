export default function getPathSeparator(path: string): string {
  return path.includes('\/') ? '\/' : path.includes('\\\\') ? '\\\\' : '\\'
}
