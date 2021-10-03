import { GrammarInterface } from '../definitions/jison.types'
import { variableIdentifierRegex, variableTypeRegex, notRegex, whiteSpace } from './GrammarConstants'


export const AchieveConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`[0-9.]+`, "return 'NUMBER'"],
      [`${whiteSpace}(=|<>)${whiteSpace}`, "return 'OCL_OPERATION_1'"],
      [`${whiteSpace}((>|<)=?)${whiteSpace}`, "return 'OCL_OPERATION_2'"],
      [`${whiteSpace}(in|&&|\\|\\|)${whiteSpace}`, "return 'OCL_OPERATION_3'"],
      [`$`, "return 'end-of-input'"],
      [`->forAll`, "return 'UNIVERSAL_CONDITION'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    achieveCondition: [
      ["VARIABLE ocl_operation end-of-input",
        `$$ = {
          type: 'Normal',
          variable: $1,
        }`
      ],
      ["VARIABLE end-of-input",
        `$$ = {
          type: 'Normal',
          variable: $1,
        }`
      ],
    ],
    ocl_operation: [
      ["OCL_OPERATION_1 NUMBER", "$$ = []"],
      ["OCL_OPERATION_2 NUMBER", "$$ = []"],
      ["OCL_OPERATION_3 VARIABLE", "$$ = [$2]"],
    ],
  }
};


export const UniversalAchieveConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`->forAll`, "return 'FOR_ALL'"],
      [`${whiteSpace}:${whiteSpace}`, "return ':'"],
      [`${notRegex}`, "return 'NOT'"],
      [`[0-9.]+`, "return 'NUMBER'"],
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
    universalAchieveCondition: [
      ["VARIABLE FOR_ALL ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
        `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $4,type:$6},
          variablesInCondition: [...$8],
        }`
      ],
      ["VARIABLE FOR_ALL ( VARIABLE | ocl ) end-of-input",
        `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $4},
          variablesInCondition: [...$6],
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
      ["OCL_OPERATION_1 NUMBER", "$$ = []"],
      ["OCL_OPERATION_2 NUMBER", "$$ = []"],
      ["OCL_OPERATION_3 VARIABLE", "$$ = [$2]"],
    ],
  }
};
