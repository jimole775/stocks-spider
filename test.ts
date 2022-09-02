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


// 定义一个用于检查构造函数的接口，该接口需要返回一个接口
interface ClockConstructor{
  new (hour: number, minute: number): ClockInterface;
}
// 继续定义一个接口，该接口接收来自上一个接口返回的内容，进行验证
interface ClockInterface {
  tick(): void
}
// 创建一个函数，返回一个函数（该函数再次执行）
function createClock(ctor: ClockConstructor, hour:number, minute:number):ClockInterface{
  return new ctor(hour, minute);    
}

// 定义一个类
class DigitalClock implements ClockInterface {    // 下层接口
  constructo(h: number, m: number) { };
  tick(){
      console.log("！！！");
  }
}

// 定义一个类
class AnalogClock implements ClockInterface {
  constructor(h: number, m: number) { };
  tick(){
      console.log("!!!!!!!!");
  }
}

// 调用租函数，传入一个类，返回一个对象
let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 2, 4);