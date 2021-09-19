import { GrammarInterface } from '../definitions/jison.types'
import { variableIdentifierRegex, variableTypeRegex, whiteSpace } from './GrammarConstants'

export const LocationGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`$`, "return 'end-of-input'"],
    ]
  },

  bnf: {
    init: [
      ["VARIABLE end-of-input",
        "$$ = $1"
      ],
    ],
  }
};


export const ParamsGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`${whiteSpace},${whiteSpace}`, "return ','"],
      [`$`, "return 'end-of-input'"],
    ]
  },

  bnf: {
    init: [
      ["variables_list end-of-input",
        "$$ = [...$1]"
      ],
    ],
    variables_list: [
      ["VARIABLE , variables_list", "$$ = [$1, ...$3]"],
      ["VARIABLE", "$$ = [$1]"],
    ]

  }
};

export const RobotNumberGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`[0-9.]+`, "return 'NUMBER'"],
      [`\\[`, "return '['"],
      [`\\]`, "return ']'"],
      [`,`, "return ','"],
      [`$`, "return 'end-of-input'"],
    ]
  },

  bnf: {
    init: [
      ["NUMBER end-of-input",
        `$$ = {
          type: 'NUMBER',
          value: $1
        }`
      ],
      ["[ NUMBER , NUMBER ] end-of-input",
        `$$ = {
          type: 'RANGE',
          value: [$2, $4]
        }`
      ],
    ],
  }
};
