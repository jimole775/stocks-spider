export function rangeEqual(a = 0, b = 0, range = 0) {
  return a >= b && a <= b * (1 + range) || a <= b && a * (1 + range) >= b
}