const { Tokenizer } = require('./Tokenizer')

const Log = console.log.bind(global)

class Parser {
  constructor () {
    this._string = ''
    this._tokenizer = new Tokenizer()
  }

  parse (string) {

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

  /**
   *  Statement
   *  : ExpressionStatement
   *  | BlockStatement
   *  | EmptyStatement
   *  | VariableStatement
   *  | IfStatement
   *  | IterationStatement
   *  | FunctionStatement
   *  | ReturnStatement
   */
  Statement () { //
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement()
      case 'if':
        return this.IfStatement()
      case '{':
        return this.BlockStatement()
      case 'let':
        return this.VariableStatement()
      case 'def':
        return this.FunctionDeclaration();
      case 'return':
        return this.ReturnStatement();
      case 'while':
      case 'do':
      case 'for':
        return this.IterationStatement()
      case 'import':
        return this.ImportStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  /**
   * ImportStatement
   *  : 'import' '{' OptImportList '}'
   */
  ImportStatement () {
    this._eat('import');
    this._eat('{');
    const imports = this.ImportList();
    this._eat('}');

    return {
      type: 'ImportStatement',
      imports,
    }
  }

  /**
   * ImportList:
   * StringLiteral
   * | ImportList ',' StringLiteral
   */
  ImportList() {
    const importList = []
    do {
      importList.push(this.StringLiteral())
    } while (this._lookahead.type === ',' && this._eat(','))
    return importList;
  }

  /**
   * FunctionDeclaration:
   * 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
   * ;
   */
  FunctionDeclaration () {
    this._eat('def');
    const name = this.Identifier()
    this._eat('(');
    const params = this._lookahead.type !== ')' ? this.FormalParameterList() : [];
    this._eat(')');

    const body = this.BlockStatement();
    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body
    }
  }

  /**
   * FormalParameterList:
   * Identifier
   * | FormalParameterList ',' Identifier
   */
  FormalParameterList() {
    const params = []
    do {
      params.push(this.Identifier())
    } while (this._lookahead.type === ',' && this._eat(','))
    return params;
  }

  /**
   * ReturnStatement:
   * 'return' OptExpression
   */
  ReturnStatement () {
    this._eat('return');
    const argument = this._lookahead.type !== ';' ? this.Expression() : null;
    this._eat(';');
    return {
      type: 'ReturnStatement',
      argument
    }
  }

  /**
   * IterationStatement
   * : WhileStatement
   * | DoWhileStatement
   * | ForStatement
   * ;
   */
  IterationStatement () {
    switch(this._lookahead.type) {
      case 'while':
        return this.WhileStatement();
      case 'do':
        return this.DoWhileStatement();
      case 'for':
        return this.ForStatement();
    }
  }

  WhileStatement () {
    this._eat('while')
    this._eat('(')
    const test = this.Expression()
    this._eat(')')

    const body = this.Statement();
    return {
      type: 'WhileStatement',
      test,
      body,
    }
  }

  DoWhileStatement(){
    this._eat('do')
    const body = this.Statement();
    this._eat('while')
    this._eat('(')
    const test = this.Expression()
    this._eat(')')
    this._eat(';')

    return {
      type: 'DoWhileStatement',
      body,
      test
    }
  }

  /**
   * ForStatement
   * : 'for' '(' OptStatementInit ';' OptExpression ';' OptExpression ')' Statement
   * ;
   */
  ForStatement(){
    this._eat('for')
    this._eat('(')

    const init = this._lookahead.type === ';' ? null : this.ForStatementInit()
    this._eat(';')

    const test = this._lookahead.type === ';' ? null : this.Expression()
    this._eat(';')

    const update = this._lookahead.type === ')' ? null : this.Expression()
    this._eat(')')

    const body = this.Statement()

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body,
    }
  }

  ForStatementInit() {
    if(this._lookahead.type === 'let') {
      return this.VariableStatementInit()
    }
    return this.Expression()
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

  /**
   * VariableStatementInit
   * : 'let' VariableDeclarationList
   * ;
   */
  VariableStatementInit () {
    this._eat('let')
    const declarations = this.VariableDeclarationList();

    return {
      type: 'VariableStatement',
      declarations
    }
  }

  VariableStatement () { // 'let' VariableDeclarationList ';'
    const variableStatement = this.VariableStatementInit()
    this._eat(';')
    return variableStatement
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

  /**
   * LeftHandSideExpression
   *  : MemberExpression
   *  ;
   */
  LeftHandSideExpression () {
    return this.CallMemberExpression()
  }

  /**
   * CallMemberExpression
   *  : MemberExpression
   *  | CallExpression
   *  ;
   */
  CallMemberExpression () {
    const member = this.MemberExpression();

    if (this._lookahead.type === '(') {
      return this._CallExpression(member)
    }

    return member;
  }

  /**
   * CallExpression
   *  : Callee Arguments
   *  ;
   * Callee
   *  : MemberExpression
   *  | CallExpression
   *  ;
   */
  _CallExpression (callee) {
    let callExpression = {
      type: 'CallExpression',
      callee,
      arguments: this.Arguments()
    }

    if (this._lookahead.type === '(') {
      callExpression = this._CallExpression(callExpression)
    }

    return callExpression
  }

  /**
   * Arguments
   *  : '(' OptArgumentList ')'
   *  ;
   */
  Arguments () {
    this._eat('(');

    const argumentsList = this._lookahead.type !== ')' ? this.ArgumentList() : [];
    this._eat(')');

    return argumentsList
  }

  /**
   * ArgumentList
   *  : AssignmentExpression
   *  | ArgumentList ',' AssignmentExpression
   *  ;
   */
  ArgumentList () {
    const argumentList = [];

    do {
      argumentList.push(this.AssignmentExpression())
    } while (this._lookahead.type === ',' && this._eat(','))

    return argumentList;
  }

  /**
   * MemberExpression
   *  : PrimaryExpression
   *  | MemberExpression '.' Identifier
   *  | MemberExpression '[' Expression ']'
   *  ;
   */
  MemberExpression () {
    let object = this.PrimaryExpression()

    while (this._lookahead.type === '.' || this._lookahead.type === '[') {

      if (this._lookahead.type === '.') {
        this._eat('.')
        const property = this.Identifier();
        object = {
          type: 'MemberExpression',
          computed: false,
          object,
          property
        }
      }

      if (this._lookahead.type === '[') {
        this._eat('[')
        const property = this.Expression();
        this._eat(']')
        object = {
          type: 'MemberExpression',
          computed: true,
          object,
          property
        }
      }
    }

    return object
  }

  Identifier () {
    const name = this._eat('IDENTIFIER').value
    return {
      type: 'Identifier',
      name
    }
  }

  _checkValidAssignmentTarget (node) {
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
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
