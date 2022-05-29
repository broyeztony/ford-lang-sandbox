class Token {
  constructor (type, value, startPos, endPos) {
    this.type = type
    this.value = value
    this.startPos = startPos
    this.endPos = endPos
  }

  toString () {
    const prefix = `[Token type:'${this.type}'`
    let buffer = ''
    switch (this.type) {
      case 'NUMBER':
      case 'STRING': buffer = `${prefix} value:${this.value}`; break
      default: buffer = `${prefix} value:'${this.value}'`
    }
    return buffer + ']'
  }
}

module.exports = {
  Token
}
