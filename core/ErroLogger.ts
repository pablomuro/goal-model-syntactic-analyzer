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

    const message = {
      nodeId: this.currentNodeRef.node.goalData.id,
      message: erroMessage
    }

    const logMessage = `${styledErrorTitle}\n${styledErrorMessage}\n`
    this.errorList.push(message)

    console.error(logMessage)
    this.errorCount++;
  }
}