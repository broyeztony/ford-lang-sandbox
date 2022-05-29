module.exports = test => {
  test(
		`
		let x = 42;
		`,
		{
		  type: 'Program',
		  body: [
		    {
		      type: 'VariableStatement',
		      declarations: [
		        {
		          type: 'VariableDeclaration',
		          id: {
		            type: 'Identifier',
		            name: 'x'
		          },
		          initializer: {
		            type: 'NumericLiteral',
		            value: 42
		          }
		        }
		      ]
		    }
		  ]
		}
  )

  test(
		`
		let x;
		`,
		{
		  type: 'Program',
		  body: [
		    {
		      type: 'VariableStatement',
		      declarations: [
		        {
		          type: 'VariableDeclaration',
		          id: {
		            type: 'Identifier',
		            name: 'x'
		          },
		          initializer: null
		        }
		      ]
		    }
		  ]
		}
  )
}
