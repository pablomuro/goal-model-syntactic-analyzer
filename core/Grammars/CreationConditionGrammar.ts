import { GrammarInterface } from '../definitions/jison.types'
import { whiteSpace, assertionConditionEvent, variableIdentifierRegex } from './GrammarConstants'


export const CreationConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`assertion`, "return 'ASSERTION'"],
      [`condition`, "return 'CONDITION'"],
      [`trigger`, "return 'TRIGGER'"],
      [`${assertionConditionEvent}`, "return 'EVENT'"],
      [`not\\s`, "return 'not'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`\\"`, `return 'DOUBLE_QUOTE';`],
      [`\\s`, "return 'WHITE_SPACE'"],
      [`,`, "return ','"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init: [
      ["assertion_condition end-of-input",
        `$$ = {
          assertion_condition: [...$1],
        }`
      ],
    ],
    assertion_condition: [
      [`ASSERTION CONDITION DOUBLE_QUOTE NOT VARIABLE DOUBLE_QUOTE`, "$$ = [$1, $2, $4, $5]"],
      [`ASSERTION CONDITION DOUBLE_QUOTE VARIABLE DOUBLE_QUOTE`, "$$ = [$1, $2, $4]"],
      [`ASSERTION TRIGGER DOUBLE_QUOTE event_list DOUBLE_QUOTE`, "$$ = [$1, $2, ...$4]"],
    ],
    event_list: [
      ["EVENT , event_list", "$$ = [$1, $2, ...$3]"],
      ["EVENT", "$$ = [$1]"],
    ]
  }
};
