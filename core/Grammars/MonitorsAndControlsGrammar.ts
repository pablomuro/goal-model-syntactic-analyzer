import { GrammarInterface } from '../definitions/jison.types'
import { variableIdentifierRegex, variableTypeRegex, whiteSpace } from './GrammarConstants'

const generalRules = [
  [`Sequence`, "return 'SEQUENCE'"],
  [`${variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
  [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
  [`${whiteSpace}:${whiteSpace}`, "return ':'"],
  [`${whiteSpace},${whiteSpace}`, "return ','"],
  [`\\(`, "return '('"],
  [`\\)`, "return ')'"],
  [`$`, "return 'end-of-input'"],
  [`\.*`, "return 'INVALID'"],
]

export const ControlsGrammar: GrammarInterface = {
  lex: {
    rules: generalRules
  },

  bnf: {
    init: [
      ["variables_list end-of-input",
        `$$ = {
          variableList: [...$1],
        }`
      ],
    ],
    variables_list: [
      [
        "VARIABLE : SEQUENCE ( VARIABLE_TYPE ) , variables_list",
        "$$ = [$1, $3, $5, ...$8]"
      ],
      [
        "VARIABLE : VARIABLE_TYPE , variables_list",
        "$$ = [$1, $3, ...$5]"
      ],
      [
        "VARIABLE : SEQUENCE ( VARIABLE_TYPE )",
        "$$ = [$1, $5]"
      ],
      [
        "VARIABLE : VARIABLE_TYPE",
        "$$ = [$1, $3]"
      ],
    ]
  }
};


export const MonitorsGrammar: GrammarInterface = {
  lex: {
    rules: generalRules
  },

  bnf: {
    init: [
      ["variables_list end-of-input",
        `$$ = {
          variableList: [...$1],
        }`
      ],
    ],
    variables_list: [
      [
        "VARIABLE : SEQUENCE ( VARIABLE_TYPE ) , variables_list",
        "$$ = [$1, $3, $5, ...$8]"
      ],
      [
        "VARIABLE : VARIABLE_TYPE , variables_list",
        "$$ = [$1, $3, ...$5]"
      ],
      [
        "VARIABLE : SEQUENCE ( VARIABLE_TYPE )",
        "$$ = [$1, $5]"
      ],
      [
        "VARIABLE : VARIABLE_TYPE",
        "$$ = [$1, $3]"
      ],
      ["VARIABLE , variables_list", "$$ = [$1, ...$3]"],
      ["VARIABLE", "$$ = [$1]"],
    ]

  }
};
