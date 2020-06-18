
/** 修饰钱类型的数值的位数
 * @param numberOrStr [String|Number]
 * @param decimal [Number]
 * @return [String]
 * @template = moneyFormat(0.0512) => 0.05
 * @template = moneyFormat(100000.0512) => 100,000.05
 */
module.exports = function moneyFormat(numberOrStr, decimal = 2) {
  // 空类型不处理
  if (numberOrStr === null || numberOrStr === undefined || numberOrStr === '') return ''
  // 保留原数字，用作正负数的标记
  const originNumber = Number.parseFloat(numberOrStr)
  // 非数字类型不处理
  if (Number.isNaN(originNumber)) return ''
  // 计算用绝对值
  const str = Math.abs(originNumber).toFixed(decimal) + ''
  const intStr = str.split('.')[0] || '' // 保存整数位
  const decimalStr = str.split('.')[1] || '' // 保存小数位
  if (intStr.length < 5) return str
  const res = []
  let step = 3
  let i = intStr.length
  while (i--) {
    if (step === 0) {
      step = 3
      res.unshift(',')
    }
    step--
    res.unshift(intStr[i])
  }
  // 处理负数，如果是负数，在首位增加 负号
  if (originNumber < 0) {
    res.unshift('-')
  }

  // 处理小数位
  const decimalArr = []
  if (decimalStr.length) {
    decimalArr.push('.')
    decimalArr.push(decimalStr)
  }
  return res.concat(decimalArr).join('')
}
