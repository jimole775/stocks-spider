function take ():Function {
  return function ():any {
    console.log('take')
  }
}

class Constr {
  static a: Number = 1
  constructor () {

  }

  @take()
  run ():any {
    console.log('run')
  }
}

const a:Constr = new Constr()
a.run()
Constr.a = 2

function test():Promise<Number> {
  return Promise.resolve(1)
}

const obj: Object = {}
