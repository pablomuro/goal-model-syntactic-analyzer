import { GrammarInterface } from '../definitions/jison.types'
import { variableIdentifierRegex, variableTypeRegex, notRegex, whiteSpace } from './GrammarConstants'


export const QueriedPropertyGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`->select`, "return 'SELECT'"],
      [`${whiteSpace}:${whiteSpace}`, "return ':'"],
      [`${notRegex}`, "return 'NOT'"],
      [`[0-9.]+`, "return 'NUMBER'"],
      [`"[a-zA-Z]+"`, "return 'STRING'"],
      [`${whiteSpace}(=|<>)${whiteSpace}`, "return 'OCL_OPERATION_1'"],
      [`${whiteSpace}((>|<)=?)${whiteSpace}`, "return 'OCL_OPERATION_2'"],
      [`${whiteSpace}(in|&&|\\|\\|)${whiteSpace}`, "return 'OCL_OPERATION_3'"],
      [`\\(${whiteSpace}`, "return '('"],
      [`${whiteSpace}\\)`, "return ')'"],
      [`${whiteSpace}\\|`, "return '|'"],
      [`\\s`, "return 'WHITE_SPACE'"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init: [
      ["VARIABLE SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
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
