const fs = require('fs')
console.log(global)
console.log(window)
interface Ac {
  name: String,
  to: Number
}

class Ac implements Ac {
  constructor () {
    this.name = 'ac'
    this.to = 123
  }
}

const ac = new Ac()
console.log(ac.to)