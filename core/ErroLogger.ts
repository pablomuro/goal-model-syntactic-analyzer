import chalk from 'chalk';
import { NodeObject } from './GoalTree';

export class ErrorLogger {
  static currentNodeRef: { node: NodeObject } = {} as { node: NodeObject }
  static errorCount: number = 0

  static errorList: any[] = []

  static log(erroMessage: any) {
    const nodeName = this.currentNodeRef.node.goalData.text

    const styledErrorTitle = chalk.bold.red(`Error on node -> "${nodeName}"`)
    const styledErrorMessage = chalk.bold.red(erroMessage)
    this.addErrorToList(nodeName, erroMessage)

    const logMessage = `${styledErrorTitle}\n${styledErrorMessage}\n`

    console.error(logMessage)
  }

  static logParser(lineNumber: string, erroString: string, positionDottedLine: string, expected: any, token: any) {
    const nodeName = this.currentNodeRef.node.goalData.text

    const printErrorRange = chalk`{red ${lineNumber} }{white.bold ${erroString}}\n{red ${positionDottedLine}}`
    const styledErrorTitle = chalk.bold.red(`Error on node -> "${nodeName}"`)

    console.log(styledErrorTitle)
    console.log(printErrorRange)

    let expectedMsg = ''

    if (expected && token) {
      expectedMsg = `Expected : ${expected.join(' or ')} got ${token}`
      console.log(chalk`{white.bold ${expectedMsg}}\n`)
    }

    const errorRangeMsg = `${lineNumber} ${erroString}}\n${positionDottedLine}\n${expectedMsg}`
    this.addErrorToList(nodeName, errorRangeMsg)
  }


  private static addErrorToList(nodeName: string, erroMessage: string) {
    const message = {
      nodeId: this.currentNodeRef.node.goalData.id,
      nodeName,
      message: erroMessage
    }
    this.errorList.push(message)
    this.errorCount++;

  }
}