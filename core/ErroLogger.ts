import chalk from 'chalk';
import { NodeObject } from './GoalTree';


export class ErrorLogger {
  static currentNodeRef: { node: NodeObject } = {} as { node: NodeObject }

  static log(erroMessage: any) {
    const styledErrorMessage = chalk.bold.red(erroMessage)
    const nodeName = this.currentNodeRef.node.goalData.text
    console.error(chalk.bold.red(`Error on Node: ${nodeName}`))
    console.error(styledErrorMessage)
  }
}