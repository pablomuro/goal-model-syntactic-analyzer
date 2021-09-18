export interface GrammarInterface {
  lex: { rules: string[][] },
  bnf: {
    [key: string]: any[]
  }
}