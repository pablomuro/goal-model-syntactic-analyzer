import chalk from 'chalk';
import { Console } from 'console';
import { GrammarInterface } from './definitions/jison.types';
const JisonAPI = require("jison-gho")
import { ErrorLogger } from './ErroLogger';


export class JisonParser {
  private parser: any;
  constructor(grammar: GrammarInterface) {
    this.parser = new JisonAPI.Parser(grammar);
    this.parser.yy.parseError = function (msg: any, hash: any) {
      if (hash?.parser?.sourceCode?.src) {
        hash.parser.sourceCode.src = null
      }

      const { token, expected } = hash
      const lexerObj = {
        ...hash.parser.lexer,
        yylloc: { ...hash.yy.lexer.yylloc },
        matched: hash.yy.lexer.matched
      }

      const erroWithRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc })

      const [errorLine, positionDottedLine] = erroWithRange.split("\n")

      const lineNumberSeparator = errorLine.indexOf(' ')
      const lineNumber = errorLine.substring(0, lineNumberSeparator)
      const erroString = errorLine.substring(lineNumberSeparator + 1)

      ErrorLogger.logParser(lineNumber, erroString, positionDottedLine, expected, token);

    }
  }

  parse(text: string) {
    return this.parser.parse(text)
  }
}