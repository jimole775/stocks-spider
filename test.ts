// import _type from 'E:/py_pro/stocks-spider/src/types/global'
// function dec ():Function {
//   console.log('dec origin')
//   return function (a:any, b:any, c:any) {
//     console.log('dec return')
//     return false
//   }
// }

// class TNT {
//   constructor () {

//   }

//   @dec()
//   entity (a:any, b:any, c:any) {
//     console.log('entity')
//   }
// }

// var tnt = new TNT()
// tnt.entity(1,2,3)

enum a {
  ShenZhen = 0,
  ShangHai = 1,  
}

type A = {
  market: typeof a
}

const tmp: A = {
  market: a.ShenZhen
}

console.log(tmp)

