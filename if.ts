export interface Person {
  name: string
  age: number
}

export abstract class Mankind implements Person {
  name: string = ''
  age: number = 0
  constructor () {

  }
  public getName () {

  }
}
