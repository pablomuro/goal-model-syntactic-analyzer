const JisonAPI = require("jison-gho")

const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const notRegex = '\\!'
const whiteSpace = '\\s*'

const queryGoalConditionOr =
  `${notRegex}${variableIdentifierRegex}  ${notRegex}${variableIdentifierRegex})`
const queryGoalConditionRegex = `(${queryGoalConditionOr}|${notRegex}${variableIdentifierRegex}|)`

var grammar = {
  lex: {
    rules: [
      [`${variableTypeRegex}`, "return 'VARIABLE_TYPE';"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE';"],
      [`->select`, "return 'SELECT';"],
      [`${whiteSpace}:${whiteSpace}`, "return ':';"],
      [`${notRegex}`, "return 'NOT';"],
      [`[0-9.]+`, "return 'NUMBER';"],
      [`"[a-zA-Z]+"`, "return 'STRING';"],
      [`${whiteSpace}(=|<>)${whiteSpace}`, "return 'OCL_OPERATION_1';"],
      [`${whiteSpace}((>|<)=?)${whiteSpace}`, "return 'OCL_OPERATION_2';"],
      [`${whiteSpace}(in|&&|\\|\\|)${whiteSpace}`, "return 'OCL_OPERATION_3';"],
      [`\\(${whiteSpace}`, "return '(';"],
      [`${whiteSpace}\\)`, "return ')';"],
      [`${whiteSpace}\\|`, "return '|';"],
      [`\\s`, "return 'WHITE_SPACE';"],
      [`$`, "return 'EOI'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    QueriedPropertyInit: [
      ["VARIABLE SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) EOI", "$$ = [$1, $2, $3, $4, $5, $6, $7, ...$8, $9];"],
    ],
    ocl: [
      ["WHITE_SPACE ocl", "$$ = $2"],
      ["VARIABLE ocl_operation", "$$ = [$1, ...$2]"],
      ["NOT VARIABLE ocl_operation", "$$ = [$1, $2, ...$3]"],
      ["VARIABLE", "$$ = [$1]"],
      ["NOT VARIABLE", "$$ = [$1, $2]"],
      ["", ''],
    ],
    ocl_operation: [
      ["OCL_OPERATION_1 STRING", "$$ = [$1, $2]"],
      ["OCL_OPERATION_1 NUMBER", "$$ = [$1, $2]"],
      ["OCL_OPERATION_2 NUMBER", "$$ = [$1, $2]"],
      ["OCL_OPERATION_3 VARIABLE", "$$ = [$1, $2]"],
    ],
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

  const printRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc })

  // console.log(hash)

  // console.log(token)
  // console.log(expected)

  console.log("\n")
  console.log(printRange)
  if (expected && token)
    console.log(`Expected : ${expected.shift()} got ${token}\n`)
}

try {
  let result = ''
  const corretos = [
    // `world_db->select(  r : Room | r.is_clean)`,
    // `world_db->select(r:Room | r.is_clean)`,
    // `world_db->select(r:Room | !r.is_clean)`,
    // `world_db->select(r:Room | r.is_clean = "asb" )`,
    // `world_db->select(r:Room | r.is_clean <> "asb" )`,
    // `world_db->select(r:Room | r.is_clean = 123 )`,
    // `world_db->select(r:Room | r.is_clean <> 123 )`,
    // `world_db->select(r:Room | r.is_clean > 123 )`,
    `world_db->select(r:Room | r.is_clean >= 123 )`,
    // `world_db->select(r:Room | r.is_clean < 123 )`,
    // `world_db->select(r:Room | r.is_clean <= 123 )`,
    // `world_db->select(r:Room | r.is_clean in c.teste )`,
    // `world_db->select(r:Room | r.is_clean && c.teste )`,
    // `world_db->select(r:Room | r.is_clean || c.teste )`,
    // `world_db->select(r:Room | )`,
  ]

  for (let teste of corretos) {
    console.log(parser.parse(teste))
  }

  const errados = [
    `world_db->seleAct(r:Room | r.is_clean)`,
    `World_db->select(r:Room | !r.is_clean)`,
    `world_db->select(r:Room | r.is_clean =  )`,
    `world_db->select(r:Room | r.is_clean <>  )`,
    `world_db->select(r:Room | r.is_clean =  )`,
    `world_db->select(r:Room | r.is_clean <>  )`,
    `world_db->select(r:Room | r.is_clean >  )`,
    `world_db->select(r:Room | r.is_clean >=  )`,
    `world_db->select(r:Room | r.is_clean <  )`,
    `world_db->select(r:Room | r.is_clean <=  )`,
    `world_db->select(r:Room | r.is_clean in  )`,
    `world_db->select(r:Room | r.is_clean &&  )`,
    `world_db->select(r:Room | r.is_clean ||  )`,
    `world_db->select(r:Room | r.is_clean )`,
  ]

  // for (let teste of errados) {
  //   parser.parse(teste)
  // }

  console.log(result)

} catch (error: Error | any) {
  if (error.hash?.parser?.sourceCode?.src) {
    error.hash.parser.sourceCode.src = null
  }
  console.log("ERROOOOR")
  console.log(error.hash)
  console.log(error.hash?.errStr)
}