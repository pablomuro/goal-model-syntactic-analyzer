"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorsGrammar = exports.ControlsGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
const generalRules = [
    [`Sequence`, "return 'SEQUENCE'"],
    [`${GrammarConstants_1.variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
    [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
    [`${GrammarConstants_1.whiteSpace}:${GrammarConstants_1.whiteSpace}`, "return ':'"],
    [`${GrammarConstants_1.whiteSpace},${GrammarConstants_1.whiteSpace}`, "return ','"],
    [`\\(`, "return '('"],
    [`\\)`, "return ')'"],
    [`$`, "return 'end-of-input'"],
    [`\.*`, "return 'INVALID'"],
];
exports.ControlsGrammar = {
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
exports.MonitorsGrammar = {
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
