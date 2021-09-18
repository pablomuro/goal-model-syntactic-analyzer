import { Console } from 'console';
import { GrammarInterface } from './definitions/jison.types';
const JisonAPI = require("jison-gho")


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

      const printRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc })

      // console.log(hash)

      // console.log(token)
      // console.log(expected)

      console.log("\n")
      console.log(printRange)
      if (expected && token) {
        console.log(`Expected : ${expected.join(' or ')} got ${token}\n`)
      }
    }
  }

  parse(text: string) {
    return this.parser.parse(text)
  }
}