import { GrammarInterface } from '../definitions/jison.types'
import { whiteSpace, assertionConditionEvent, variableIdentifierRegex } from './GrammarConstants'


export const ContextGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`Condition`, "return 'CONDITION'"],
      [`Trigger`, "return 'TRIGGER'"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    context: [
      ["TRIGGER end-of-input",
        `$$ = {
          contextType: 'Trigger',
        }`
      ],
      ["CONDITION end-of-input",
        `$$ = {
          contextType: 'Condition',
        }`
      ],
    ],
  }
};

export const TriggerGrammar: GrammarInterface = {
  lex: {
    rules: [

      [`${assertionConditionEvent}`, "return 'EVENT'"],
      [`,`, "return ','"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    event_init: [
      ["event_list end-of-input",
        `$$ = {
          event_list: [...$1],
        }`
      ],
    ],
    event_list: [
      ["EVENT , event_list", "$$ = [$1, ...$3]"],
      ["EVENT", "$$ = [$1]"],
    ]
  }
};

export const ConditionGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`not\\s`, "return 'NOT'"],
      [`${variableIdentifierRegex}`, "return 'VARIABLE'"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init_condition: [
      ["condition end-of-input",
        `$$ = {
          condition: [...$1],
        }`
      ],
    ],
    condition: [
      [`NOT VARIABLE`, "$$ = [$1, $2]"],
      [`VARIABLE`, "$$ = [$1]"],
    ],
  }
};