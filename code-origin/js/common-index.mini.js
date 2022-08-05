// const { commomParams: commonParams } = require('./common')
import { commomParams } from './common.js'
const commonDefault = require('./common.js')

class Person {
  constructor (name, age) {
    this.name = name
    this.age = age
  }

  sayName () {
    console.log(`hello my name is ${this.name}`)
  }
}

const aPerson = new Person('xiaoming', 18)
aPerson.sayName()

const arr = ['apple', 'origin', 'other']
let fruitName = 'banner'

console.log(`the includes result is ${arr.includes(fruitName)}`)

console.log('the commonDefault value is')
console.log(commonDefault)

console.log('the commomParams value is')
console.log(commomParams)


const el = $(".box")
console.log(el)