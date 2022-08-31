/**
 * 可当做约等于使用
 * @param { Number } a
 * @param { Number } b
 * @param { Number } range 允许的差额(百分比)
 * @return { Boolean }
 * @template rangeEqual(5.5 * 6.6, 5 * 6, 0.2) => false
 * @template rangeEqual(5.5 * 6.6, 5 * 6, 0.3) => true
 */
module.exports = function rangeEqual(a = 0, b = 0, range = 0) {
  return (a >= b && a <= b * (1 + range)) || (a <= b && a * (1 + range) >= b)
}
