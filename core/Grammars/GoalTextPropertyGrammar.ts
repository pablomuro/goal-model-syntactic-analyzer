import { GrammarInterface } from '../definitions/jison.types'
import { whiteSpace } from './GrammarConstants'


export const GoalTextPropertyGrammar: GrammarInterface = {
  lex: {
    rules: [
      [`^G[0-9]+`, "return 'GOAL_ID'"],
      [`FALLBACK`, "return 'ANNOTATION_FALLBACK'"],
      [`(\\w+[^\\[]*\\s*)+`, "return 'GOAL_TEXT'"],
      [`#|;`, "return 'ANNOTATION_OPERATION'"],
      [`:${whiteSpace}`, "return ':'"],
      [`\\[`, "return '['"],
      [`\\]`, "return ']'"],
      [`\\(`, "return '('"],
      [`\\)`, "return ')'"],
      [`\\s`, "return 'WHITE_SPACE'"],
      [`,`, "return ','"],
      [`$`, "return 'end-of-input'"],
      [`\.*`, "return 'INVALID'"],
    ]
  },

  bnf: {
    init: [
      ["GOAL_ID : GOAL_TEXT [ goal_runtime_annotation ] end-of-input",
        `$$ = {
          goalId: $1,
          goalText: $3,
          goalRuntimeAnnotation: [...$5],
        }`
      ],
      ["GOAL_ID : GOAL_TEXT end-of-input",
        `$$ = {
          goalId: $1,
          goalText: $3,
        }`
      ],
    ],
    goal_runtime_annotation: [
      ["GOAL_ID ANNOTATION_OPERATION goal_id_list", "$$ = [$1, $2, ...$3]"],
      ["ANNOTATION_FALLBACK ( fallback_goal_list )", "$$ = [$1, ...$3]"],
    ],
    goal_id_list: [
      ["GOAL_ID ANNOTATION_OPERATION goal_id_list", "$$ = [$1, $2, ...$3]"],
      ["GOAL_ID", "$$ = [$1]"],
    ],
    fallback_goal_list: [
      ["ANNOTATION_FALLBACK ( fallback_goal_list ) , fallback_goal_list", "$$ = [$1, ...$3, ...$5]"],
      ["ANNOTATION_FALLBACK ( fallback_goal_list )", "$$ = [$1, ...$3]"],
      ["GOAL_ID , GOAL_ID", "$$ = [$1, $3]"],
      ["GOAL_ID", "$$ = [$1]"],
    ]
  }
};
