import { GrammarInterface } from './definitions/jison.types'


const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const notRegex = '\\!'
const whiteSpace = '\\s*'

export const QueriedPropertyGrammar: GrammarInterface = {
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
      ["VARIABLE SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) EOI",
        `$$ = {
          queriedVariable: $1,
          queryVariable: {value: $4,type:$6},
          variablesInCondition: [...$8],
        }`
      ],
    ],
    ocl: [
      ["WHITE_SPACE ocl", "$$ = $2"],
      ["VARIABLE ocl_operation", "$$ = [$1, ...$2]"],
      ["NOT VARIABLE ocl_operation", "$$ = [$2, ...$3]"],
      ["VARIABLE", "$$ = [$1]"],
      ["NOT VARIABLE", "$$ = [$2]"],
      ["", "$$ = []"],
    ],
    ocl_operation: [
      ["OCL_OPERATION_1 STRING", "$$ = []"],
      ["OCL_OPERATION_1 NUMBER", "$$ = []"],
      ["OCL_OPERATION_2 NUMBER", "$$ = []"],
      ["OCL_OPERATION_3 VARIABLE", "$$ = [$2]"],
    ],
  }
};
