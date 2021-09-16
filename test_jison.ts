const JisonAPI = require("jison-gho")

const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const notRegex = '\\!'
const whiteSpace = '\\s*'

const queryGoalConditionOr =
  `${notRegex}${variableIdentifierRegex}  ${notRegex}${variableIdentifierRegex})`
const queryGoalConditionRegex = `(${queryGoalConditionOr}|${notRegex}${variableIdentifierRegex}|)`


var grammar = {
  "lex": {
    "rules": [
      [`[A-Z][a-zA-Z_0-9]*`, "return 'VARIABLE_TYPE';"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE';"],
      [`->select`, "return 'SELECT';"],
      [`:`, "return ':';"],
      [`${whiteSpace}\\|${whiteSpace}`, "return '|';"],
      [`\\(`, "return '(';"],
      [`${notRegex}`, "return 'NOT';"],
      [`${whiteSpace}(=|<>) ("[a-zA-Z]+"|[0-9.]+)|(>|<)=? [0-9.]+|(in|&&|\\|\\|)${whiteSpace}`, "return 'OCL_OPERATION';"],
      [`\\)`, "return ')';"],
      [`$`, "return 'EOI'"],
      ["\\.*", "return 'INVALID';"]
    ]
  },

  "bnf": {
    "expression": [
      ["VARIABLE SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) EOI", "$$  =true"],
      ['INVALID', "console.log(yytext)"],
    ],
    "ocl": [
      ["NOT VARIABLE OCL_OPERATION", ""],
      ["VARIABLE OCL_OPERATION", ""],
      ["NOT VARIABLE", ""],
      ["VARIABLE", ""],
      ['INVALID', "console.log(yytext)"],
    ]
  }
};

var parser = new JisonAPI.Parser(grammar);
parser.yy.parseError = function (msg: any, hash: any) {
  if (hash?.parser?.sourceCode?.src) {
    hash.parser.sourceCode.src = null
  }

  const { token, expected } = hash
  const lexerObj = {
    ...hash.parser.lexer,
    yylloc: { ...hash.yy.lexer.yylloc },
    matched: hash.yy.lexer.matched
  }

  const printRange = lexerObj.prettyPrintRange(lexerObj.yylloc)


  console.log(printRange)
  console.log(token, expected)
}


try {
  let result = ''
  result = parser.parse("world_db->select(r: Room | r.is_clean)");
  console.log(result)

} catch (error: Error | any) {
  if (error.hash?.parser?.sourceCode?.src) {
    error.hash.parser.sourceCode.src = null
  }
  // console.log(error.hash)
  console.log(error.hash.errStr)
}