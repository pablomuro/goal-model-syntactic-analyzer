"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalTextPropertyGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.GoalTextPropertyGrammar = {
    lex: {
        rules: [
            [`^G[0-9]+`, "return 'GOAL_ID'"],
            [`FALLBACK`, "return 'ANNOTATION_FALLBACK'"],
            [`(\\w+\\s*)+`, "return 'GOAL_TEXT'"],
            [`#|;`, "return 'ANNOTATION_OPERATION'"],
            [`:${GrammarConstants_1.whiteSpace}`, "return ':'"],
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
            ["GOAL_ID ANNOTATION_OPERATION GOAL_ID", "$$ = [$1, $2, $3]"],
            ["ANNOTATION_FALLBACK ( fallback_goal_list )", "$$ = [$1, ...$3]"],
        ],
        fallback_goal_list: [
            ["GOAL_ID , fallback_goal_list", "$$ = [$1, $2, ...$3]"],
            ["GOAL_ID", "$$ = [$1]"],
        ]
    }
};
