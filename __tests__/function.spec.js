module.exports = test => {
  test(
		`
		def square {
    	return _.x * _.x;
		}
		`,
		{
			type: 'Program',
			body: [
				{
					"type": "FunctionDeclaration",
					"name": {
						"type": "Identifier",
						"name": "square"
					},
					"body": {
						"type": "BlockStatement",
						"body": [
							{
								"type": "ReturnStatement",
								"argument": {
									"type": "BinaryExpression",
									"operator": "*",
									"left": {
										"type": "MemberExpression",
										"computed": false,
										"object": {
											"type": "Identifier",
											"name": "_"
										},
										"property": {
											"type": "Identifier",
											"name": "x"
										}
									},
									"right": {
										"type": "MemberExpression",
										"computed": false,
										"object": {
											"type": "Identifier",
											"name": "_"
										},
										"property": {
											"type": "Identifier",
											"name": "x"
										}
									}
								}
							}
						]
					}
				}
			]
		}
  )


}
