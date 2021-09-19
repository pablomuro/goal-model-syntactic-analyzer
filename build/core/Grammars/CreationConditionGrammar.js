"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreationConditionGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.CreationConditionGrammar = {
    lex: {
        rules: [
            [`^assertion`, "return 'ASSERTION'"],
            [`condition`, "return 'CONDITION'"],
            [`trigger`, "return 'TRIGGER'"],
            [`not\\s`, "return 'NOT'"],
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`${GrammarConstants_1.assertionConditionEvent}`, "return 'EVENT'"],
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
          assertionCondition: [...$1],
        }`
            ],
        ],
        assertion_condition: [
            [`ASSERTION WHITE_SPACE CONDITION WHITE_SPACE DOUBLE_QUOTE NOT VARIABLE DOUBLE_QUOTE`, "$$ = [$1, $2, $4, $5]"],
            [`ASSERTION WHITE_SPACE CONDITION WHITE_SPACE DOUBLE_QUOTE VARIABLE DOUBLE_QUOTE`, "$$ = [$1, $2, $4]"],
            [`ASSERTION WHITE_SPACE TRIGGER WHITE_SPACE DOUBLE_QUOTE event_list DOUBLE_QUOTE`, "$$ = [$1, $2, ...$4]"],
        ],
        event_list: [
            ["EVENT , event_list", "$$ = [$1, $2, ...$3]"],
            ["VARIABLE , event_list", "$$ = [$1, $2, ...$3]"],
            ["EVENT", "$$ = [$1]"],
            ["VARIABLE", "$$ = [$1]"],
        ]
    }
};
