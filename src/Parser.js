const { Tokenizer } = require('./Tokenizer')

const Log = console.log.bind(global)

class Parser {
  constructor () {
    this._string = ''
    this._tokenizer = new Tokenizer()
  }

  parse (string) {

    // console.log('@ parse', string.length, string.trim().length)
    this._string = string.trim()
    if(this._string.length > 0) {
      this._tokenizer.init(string)
      this._lookahead = this._tokenizer.getNextToken() // LL(1)

      return this.Program()
    }
    return null
  }

  Program () {
    return {
      type: 'Program',
      body: this.StatementList()
    }
  }

  StatementList (stopLookahead = null) {
    const statementList = [this.Statement()]
    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement())
    }
    return statementList
  }

  Statement () { // ExpressionStatement | BlockStatement | EmptyStatement | VariableStatement | IfStatement
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement()
      case 'if':
        return this.IfStatement()
      case '{':
        return this.BlockStatement()
      case 'let':
        return this.VariableStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  /**
	 * 'if' ( expression ) Statement
	 * 'if' ( expression ) Statement 'else' Statement
	 */
  IfStatement () {
    this._eat('if')
    this._eat('(')
    const test = this.Expression()
    this._eat(')')

    const consequent = this.Statement()
    const alternate = this._lookahead != null && this._lookahead.type === 'else'
      ? this._eat('else') && this.Statement()
      : null

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    }
  }

  VariableStatement () { // 'let' VariableDeclarationList ';'
    this._eat('let')
    const declarations = this.VariableDeclarationList()
    this._eat(';')
    return {
      type: 'VariableStatement',
      declarations
    }
  }

  /**
	 *  VariableDeclaration | VariableDeclarationList
	 */
  VariableDeclarationList () {
    const declarations = []
    do {
      declarations.push(this.VariableDeclaration())
    } while (this._lookahead.type === ',' && this._eat(','))
    return declarations
  }

  VariableDeclaration () {
    const id = this.Identifier()
    const initializer = this._lookahead.type !== ';' && this._lookahead.type !== ','
      ? this.VariableInitializer()
      : null

    return {
      type: 'VariableDeclaration',
      id,
      initializer
    }
  }

  VariableInitializer () { // ... = AssignmentExpression
    this._eat('SIMPLE_ASSIGN')
    return this.AssignmentExpression()
  }

  BlockStatement () { // { OptStatementList }
    this._eat('{')
    const body = this._lookahead.type === '}' ? [] : this.StatementList('}')
    this._eat('}')
    return {
      type: 'BlockStatement',
      body
    }
  }

  EmptyStatement () {
    this._eat(';')
    return {
      type: 'EmptyStatement'
    }
  }

  ExpressionStatement () {
    const expression = this.Expression()
    this._eat(';')
    return {
      type: 'ExpressionStatement',
      expression
    }
  }

  Expression () {
    return this.AssignmentExpression()
  }

  /**
	 * AssignmentExpression
	 *  : LogicalORExpression
	 *  | LHS '=' AssignmentExpression
	 * @returns {{type: string, operator, left, right}}
	 * @constructor
	 */
  AssignmentExpression () {
    const left = this.LogicalORExpression()
    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left
    }

    return {
      type: 'AssignmentExpression',
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression()
    }
  }

  /**
	 * RELATIONAL_OPERATOR >, <, >=, <=
	 */
  RelationalExpression () {
    return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR')
  }

  LeftHandSideExpression () {
    return this.PrimaryExpression()
  }

  Identifier () {
    const name = this._eat('IDENTIFIER').value
    return {
      type: 'Identifier',
      name
    }
  }

  _checkValidAssignmentTarget (node) {
    if (node.type === 'Identifier') {
      return node
    }
    throw new SyntaxError('Invalid left-hand side in assignment expression')
  }

  _isAssignmentOperator (tokenType) {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN'
  }

  AssignmentOperator () {
    if (this._lookahead.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN')
    }
    return this._eat('COMPLEX_ASSIGN')
  }

  LogicalORExpression() {
    return this._logicalExpression('LogicalANDExpression', 'LOGICAL_OR')
  }

  LogicalANDExpression() {
    return this._logicalExpression('EqualityExpression', 'LOGICAL_AND')
  }

  EqualityExpression () {
    return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR')
  }

  _logicalExpression (builderName, operatorToken) {
    let left = this[builderName]()
    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value
      const right = this[builderName]()
      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right
      }
    }
    return left
  }

  _BinaryExpression (builderName, operatorToken) {
    let left = this[builderName]()
    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value
      const right = this[builderName]()
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right
      }
    }
    return left
  }

  /**
	 * AdditiveExpression
	 *  : MultiplicativeExpression
	 *  | AdditiveExpression ADDITIVE_OP MultiplicativeExpression -> MultiplicativeExpression ADDITIVE_OP MultiplicativeExpression ADDITIVE_OP MultiplicativeExpression ...(expanded)
	 */
  AdditiveExpression () {
    return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR')
  }

  MultiplicativeExpression () {
    return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR')
  }

  /**
   * UnaryExpression
   *  : LeftHandSideExpression
   *  | ADDITIVE_OPERATOR UnaryExpression
   *  | LOGICAL_NOT UnaryExpression
   *  ;
   */
  UnaryExpression () {
    let operator;
    switch (this._lookahead.type) {
      case 'ADDITIVE_OPERATOR':
        operator = this._eat('ADDITIVE_OPERATOR').value
        break;
      case 'LOGICAL_NOT':
        operator = this._eat('LOGICAL_NOT').value
        break;
    }
    if(operator != null) {
      return {
        type: 'UnaryExpression',
        operator,
        argument: this.UnaryExpression()
      }
    }
    return this.LeftHandSideExpression()
  }

  /***
	 * PrimaryExpression
	 * : Literal
	 * | ParenthesizedExpression
	 * | Identifier
	 */
  PrimaryExpression () {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal()
    }
    switch (this._lookahead.type) {
      case '(':
        return this.ParenthesizedExpression()
      case 'IDENTIFIER':
        return this.Identifier()
      default:
        return this.LeftHandSideExpression()
    }
  }

  _isLiteral (tokenType) {
    return (
      tokenType === 'NUMBER' || tokenType === 'STRING' || tokenType === 'true' || tokenType === 'false' || tokenType === 'null'
    )
  }

  /**
	 *  ParenthesizedExpression
	 *    : ( Expression )
	 *    ;
	 */
  ParenthesizedExpression () {
    this._eat('(')
    const expression = this.Expression()
    this._eat(')')
    return expression
  }

  Literal () { // NumericLiteral | StringLiteral | BooleanLiteral | NullLiteral
    switch (this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral()
      case 'STRING':
        return this.StringLiteral()
      case 'true':
        return this.BooleanLiteral(true)
      case 'false':
        return this.BooleanLiteral(false)
      case 'null':
        return this.NullLiteral(false)
    }
    throw new SyntaxError('Literal: unexpected literal production')
  }

  BooleanLiteral (value) {
    this._eat(value ? 'true' : 'false')
    return {
      type: 'BooleanLiteral',
      value
    }
  }

  NullLiteral (value) {
    this._eat('null')
    return {
      type: 'NullLiteral',
      value: null
    }
  }

  NumericLiteral () {
    const token = this._eat('NUMBER')
    return {
      type: 'NumericLiteral',
      value: Number(token.value)
    }
  }

  StringLiteral () {
    const token = this._eat('STRING')
    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1)
    }
  }

  _eat (tokenType) {
    const token = this._lookahead
    if (token == null) {
      throw new SyntaxError(`Unexpected end of input, expected: "${tokenType}"`)
    }
    if (token.type !== tokenType) {
      throw new SyntaxError(`Unexpected token "${token.value}", expected: "${tokenType}"`)
    }

    this._lookahead = this._tokenizer.getNextToken()
    return token
  }
}

module.exports = {
  Parser
}
