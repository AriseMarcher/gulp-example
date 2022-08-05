const { commomParams: commonParams } = require('./common')
const commonDefault = require('./common')

const arr = ['apple', 'origin', 'other']
let fruitName = 'banner'

console.log(`the includes result is ${arr.includes(fruitName)}`)

console.log('the commonDefault value is')
console.log(commonDefault)

console.log('the commomParams value is')
console.log(commonParams)


const el = $(".box")
console.log(el)