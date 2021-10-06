import { GrammarInterface } from '../definitions/jison.types';
import { notRegex, variablePropertyIdentifierRegex, variableIdentifierRegex, variableTypeRegex, whiteSpace } from './GrammarConstants';


export const AchieveConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`[0-9.]+`, "return 'NUMBER'"],
      [`${whiteSpace}(=|<>)${whiteSpace}`, "return 'OCL_OPERATION_1'"],
      [`${whiteSpace}((>|<)=?)${whiteSpace}`, "return 'OCL_OPERATION_2'"],
      [`${whiteSpace}(&&|\\|\\||=|<>)${whiteSpace}`, "return 'OCL_OPERATION_3'"],
      [`$`, "return 'end-of-input'"],
      [`->forAll`, "return 'UNIVERSAL_CONDITION'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    achieveCondition: [
      ["VARIABLE PROPERTY ocl_operation end-of-input",
        `$$ = {
          type: 'Normal',
          variable: $1,
        }`
      ],
      ["VARIABLE PROPERTY end-of-input",
        `$$ = {
          type: 'Normal',
          variable: $1,
        }`
      ],
    ],
    ocl_operation: [
      ["OCL_OPERATION_1 NUMBER", "$$ = []"],
      ["OCL_OPERATION_2 NUMBER", "$$ = []"],
      ["OCL_OPERATION_3 VARIABLE PROPERTY", "$$ = [$2]"],
    ],
  }
};


export const UniversalAchieveConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
      [`${variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`->forAll`, "return 'FOR_ALL'"],
      [`${whiteSpace}:${whiteSpace}`, "return ':'"],
      [`${notRegex}`, "return 'NOT'"],
      [`[0-9.]+`, "return 'NUMBER'"],
      [`${whiteSpace}(=|<>)${whiteSpace}`, "return 'OCL_OPERATION_1'"],
      [`${whiteSpace}((>|<)=?)${whiteSpace}`, "return 'OCL_OPERATION_2'"],
      [`${whiteSpace}(&&|\\|\\|)${whiteSpace}`, "return 'OCL_OPERATION_3'"],
      [`${whiteSpace}(in)${whiteSpace}`, "return 'OCL_OPERATION_IN'"],
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
          iterationVariable: {value: $5,type:$7},
          variablesInCondition: [...$9],
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
      ["VARIABLE PROPERTY FOR_ALL ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
        `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $5,type:$7},
          variablesInCondition: [...$9],
        }`
      ],
      ["VARIABLE PROPERTY FOR_ALL ( VARIABLE | ocl ) end-of-input",
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
      ["VARIABLE PROPERTY ocl_operation", "$$ = [$1, ...$3]"],
      ["NOT VARIABLE PROPERTY ocl_operation", "$$ = [$2, ...$4]"],
      ["VARIABLE PROPERTY", "$$ = [$1]"],
      ["NOT VARIABLE PROPERTY", "$$ = [$2]"],
      ["", "$$ = []"],
    ],
    ocl_operation: [
      ["OCL_OPERATION_1 NUMBER", "$$ = []"],
      ["OCL_OPERATION_2 NUMBER", "$$ = []"],
      ["OCL_OPERATION_3 VARIABLE PROPERTY", "$$ = [$2]"],
      ["OCL_OPERATION_IN VARIABLE PROPERTY", "$$ = [$2]"],
      ["OCL_OPERATION_IN VARIABLE", "$$ = [$2]"],
    ],
  }
};
