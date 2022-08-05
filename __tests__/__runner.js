const { Parser } = require('../src/Parser')
const parser = new Parser()

function exec () {
  const program = `
		x > 0 == false;
		let b = true;
	`
  const ast = parser.parse(program)
  console.log(JSON.stringify(ast, null, 2))
}

exec()

const tests = [
  require('./literals.spec'),
  require('./statement.list.spec'),
  require('./block.statement.spec'),
  require('./empty.statement.spec'),
  require('./math.binop.spec'),
  require('./assign.spec'),
  require('./variable.spec'),
  require('./if.spec'),
  require('./relational.spec'),
  require('./equality.spec')
]

tests.forEach(testRun => testRun((program, expected) => {
  const ast = parser.parse(program)
  const AST = JSON.stringify(ast)
  if (JSON.stringify(expected) !== AST) {
    throw new Error(`ParseError expected ${JSON.stringify(expected)}, got ${AST}`)
  }
  console.log('All assertions passed.')
}))
