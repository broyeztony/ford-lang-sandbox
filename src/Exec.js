const { Parser } = require('../src/Parser')
const fs = require('fs')
const parser = new Parser()

const Exec = (programFile) => {
  const f = fs.readFileSync(programFile).toString()
  const ast = parser.parse(f)
  console.log(JSON.stringify(ast, null, 2))
}

Exec('./samples/main.ford')
