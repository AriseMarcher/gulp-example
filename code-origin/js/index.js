// 验证 Class语法

class Person {
  constructor (name, age) {
    this.name = name
    this.age = age
  }

  sayHello () {
    const value = `hello, my name is ${this.name}`
    console.log(value)
  }
}

const aBoy = new Person('Steven', 18)
aBoy.sayHello()

// 验证数组的 includes方法

const arr = ['apple', 'origin', 'other']
let fruitName = 'banner'

console.log(arr.includes(fruitName))

let loadData = new Promise((res, err) => {
  if (res) {
    resolve(res)
  } else {
    reject('error')
  }
})
loadData('123').then(res => {
  console.log(res)
})
