module.exports = test => {
  test(
    '42;', {
		  type: 'Program',
		  body: [
		    {
		      type: 'ExpressionStatement',
		      expression: {
		        type: 'NumericLiteral',
		        value: 42
		      }
		    }
		  ]
    }
  )

  test(
    '"42";', {
		  type: 'Program',
		  body: [
		    {
		      type: 'ExpressionStatement',
		      expression: {
		        type: 'StringLiteral',
		        value: '42'
		      }
		    }
		  ]
    }
  )

  test(
    '\'42\';', {
		  type: 'Program',
		  body: [
		    {
		      type: 'ExpressionStatement',
		      expression: {
		        type: 'StringLiteral',
		        value: '42'
		      }
		    }
		  ]
    }
  )
}
