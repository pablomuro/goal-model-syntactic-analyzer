"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotNumberGrammar = exports.ParamsGrammar = exports.LocationGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.LocationGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
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
exports.ParamsGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`${GrammarConstants_1.whiteSpace},${GrammarConstants_1.whiteSpace}`, "return ','"],
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
exports.RobotNumberGrammar = {
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
