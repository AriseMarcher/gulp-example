function sayHello (name) {
  // console.log(`the name is ${name}`)
  console.log('the name is ' + name)
  return 'hello' + name
  // return `hello ${name}`
}

document.querySelector('.content').addEventListener('click', function () {
  alert(sayHello('gulp'))
})
