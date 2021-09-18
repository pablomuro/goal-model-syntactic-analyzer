const JisonAPI = require("jison-gho")

const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const notRegex = '\\!'
const whiteSpace = '\\s*'


const goalTextPropertyRegex = /^G[0-9]+:\s*(\w*\s*(?!FALLBACK))*(([G[0-9]+(;|\#)G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g

'G4: Clean Current Room'


var grammar = {
  lex: {
    rules: [
      [`^G[0-9]+`, "return 'GOAL_ID';"],
      [`(\\w+\\s+)+`, "return 'GOAL_TEXT';"],
      [`#|;`, "return 'ANNOTATION_OPERATION';"],
      [`FALLBACK`, "return 'ANNOTATION_FALLBACK';"],
      [`:${whiteSpace}`, "return ':';"],
      [`\\[`, "return '[';"],
      [`\\]`, "return ']';"],
      [`\\(`, "return '(';"],
      [`\\)`, "return ')';"],
      [`\\s`, "return 'WHITE_SPACE';"],
      [`,`, "return ',';"],
      [`$`, "return 'EOI'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init: [
      ["GOAL_ID : GOAL_TEXT [ goal_runtime_annotation ] EOI",
        `$$ = {
          goalId: $1,
          goalText: $3,
          goalRuntimeAnnotation: [...$5],
        }`
      ],
    ],
    goal_runtime_annotation: [
      ["GOAL_ID ANNOTATION_OPERATION GOAL_ID", "$$ = [$1, $2, $3]"],
      ["ANNOTATION_FALLBACK ( fallback_goal_list )", "$$ = [$1, ...$3]"],
    ],
    fallback_goal_list: [
      ["GOAL_ID , fallback_goal_list", "$$ = [$1, $2, ...$3]"],
      ["GOAL_ID", "$$ = [$1]"],
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

  const printRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc })

  // console.log(hash)

  console.log(token)
  console.log(expected)

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
    // `world_db->select(r:Room | r.is_clean >= 123 )`,
    // `world_db->select(r:Room | r.is_clean < 123 )`,
    // `world_db->select(r:Room | r.is_clean <= 123 )`,
    // `world_db->select(r:Room | r.is_clean in c.teste )`,
    // `world_db->select(r:Room | r.is_clean && c.teste )`,
    // `world_db->select(r:Room | r.is_clean || c.teste )`,
    'G1: Clean All Dirty Rooms [G2;G3]',
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