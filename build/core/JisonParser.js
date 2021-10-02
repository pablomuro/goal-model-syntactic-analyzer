"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JisonParser = void 0;
const chalk_1 = __importDefault(require("chalk"));
const JisonAPI = require("jison-gho");
class JisonParser {
    constructor(grammar) {
        this.parser = new JisonAPI.Parser(grammar);
        this.parser.yy.parseError = function (msg, hash) {
            if (hash?.parser?.sourceCode?.src) {
                hash.parser.sourceCode.src = null;
            }
            const { token, expected } = hash;
            const lexerObj = {
                ...hash.parser.lexer,
                yylloc: { ...hash.yy.lexer.yylloc },
                matched: hash.yy.lexer.matched
            };
            const erroWithRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc });
            const [errorLine, positionDottedLine] = erroWithRange.split("\n");
            const lineNumberSeparator = errorLine.indexOf(' ');
            const lineNumber = errorLine.substring(0, lineNumberSeparator);
            const erroString = errorLine.substring(lineNumberSeparator + 1);
            const printErrorRange = () => {
                return chalk_1.default `{red ${lineNumber} }{white.bold ${erroString}}\n{red ${positionDottedLine}}`;
            };
            console.log(printErrorRange());
            if (expected && token) {
                console.log(chalk_1.default `{white.bold Expected : ${expected.join(' or ')} got ${token}}\n`);
            }
        };
    }
    parse(text) {
        return this.parser.parse(text);
    }
}
exports.JisonParser = JisonParser;
