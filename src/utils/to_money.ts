/**
 * 数字转金钱
 * @param { Number | String } number 输入数字
 * @param { Number } decimals 保留的小数位，默认 2
 * @param { String } decPoint 小数点符号
 * @param { String } thousandsSep 千分位符号
 * @return { String }
 * @template toMoney(1234) => '123,4.00'
 * @template toMoney(1234, 3) => '123,4.000'
 */
 export default function toMoney (number: number|string, decimals: number = 2, decPoint: string, thousandsSep: string): string {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
  var s: string | string[] = ''
  var toFixedFix = function (n: number, prec: number) {
    var k = Math.pow(10, prec)
    return '' + Math.round(n * k) / k
  }
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  var re = /(-?\d+)(\d{3})/
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2')
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}
