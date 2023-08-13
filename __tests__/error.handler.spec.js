module.exports = test => {
  test(
		`
		let z = square({ x: a }) -> {};
		`,
		{
			"type": "Program",
			"body": [
				{
					"type": "VariableStatement",
					"declarations": [
						{
							"type": "VariableDeclaration",
							"id": {
								"type": "Identifier",
								"name": "z"
							},
							"initializer": {
								"type": "CallExpression",
								"callee": {
									"type": "Identifier",
									"name": "square"
								},
								"arguments": [
									{
										"type": "ObjectLiteral",
										"values": [
											{
												"name": "x",
												"value": {
													"type": "Identifier",
													"name": "a"
												}
											}
										]
									}
								]
							},
							"errorHandler": {
								"type": "BlockStatement",
								"body": []
							}
						}
					]
				}
			]
		}
  )
}
