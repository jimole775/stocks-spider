import _type from 'E:/py_pro/stocks-spider/src/types/global'
function dec ():Function {
  console.log('dec origin')
  return function (a:any, b:any, c:any) {
    console.log('dec return', a, b, c)
  }
}

class TNT {
  constructor () {

  }

  @dec()
  entity (a:any, b:any, c:any) {
    console.log('entity')
  }
}

var tnt = new TNT()
tnt.entity(1,2,3)
