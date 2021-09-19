import { GrammarInterface } from '../definitions/jison.types'
import { whiteSpace } from './GrammarConstants'


export const TaskTextPropertyGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`^AT[0-9]+`, "return 'TASK_ID'"],
      [`(\\w+\\s*)+`, "return 'TASK_TEXT'"],
      [`:${whiteSpace}`, "return ':'"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init: [
      ["TASK_ID : TASK_TEXT end-of-input",
        `$$ = {
          taskId: $1,
          taskText: $3,
        }`
      ],
    ],
  }
};
