"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTextPropertyGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.TaskTextPropertyGrammar = {
    lex: {
        rules: [
            [`^AT[0-9]+`, "return 'TASK_ID'"],
            [`(\\w+\\s*)+`, "return 'TASK_TEXT'"],
            [`:${GrammarConstants_1.whiteSpace}`, "return ':'"],
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
