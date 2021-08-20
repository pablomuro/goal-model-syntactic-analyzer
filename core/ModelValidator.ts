import { ErrorLogger } from './ErroLogger';
import { GoalTree, Node } from './GoalTree';
import { ModelRulesValidator } from './ModelRulesValidator';
import { GOAL_NODE_TYPE_GOAL, GOAL_NODE_TYPE_TASK, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM, GOAL_TYPE_QUERY } from './utils/constants';
import { getControlsVariablesList, ObjectType } from './utils/utils';
import chalk from 'chalk';
export class ModelValidator extends ModelRulesValidator {

  GOAL_ID = 'G'
  TASK_ID = 'AT'
  idChecker = (_ID: string) => {
    let count = 0
    const ID = _ID
    return () => {
      count++
      return `${ID}${count}`
    }
  }

  goalIdChecker: Function
  taskIdChecker: Function

  constructor(
    tree: GoalTree,
    typesMap: Map<string, string>,
    tasksVarMap: Map<string, Map<string, string>>,
    hddl: string
  ) {
    super(tree, typesMap, tasksVarMap, hddl)

    this.goalIdChecker = this.idChecker(this.GOAL_ID)
    this.taskIdChecker = this.idChecker(this.TASK_ID)
  }

  resetValidator() {
    this.goalIdChecker = this.idChecker(this.GOAL_ID)
    this.taskIdChecker = this.idChecker(this.TASK_ID)
    this.currentNodeRef.node = { ...this.tree.root }
    ErrorLogger.errorCount = 0
  }

  validateModel() {
    console.log(chalk.greenBright('Validating Goal Model'))
    let visited: any[] = []
    let current = this.tree.root;

    const context: any = {}
    const variablesList: ObjectType = {}

    let validate = (node: Node, context: any, variablesList: ObjectType) => {
      visited.push(node.goalData?.text);

      this.manageContext(context, node)
      this.manageVariablesList(variablesList, node)
      this.validateNode(node, context, variablesList)
      node.children.forEach(_node => validate(_node, context, variablesList))

    };
    validate(current, context, variablesList);

    console.log(chalk.greenBright('Validation finished'))
    return visited;
  }
  private validateNode(node: Node, context: any, variablesList: ObjectType) {
    this.currentNodeRef.node = { ...node }

    const goalData = node.goalData
    switch (goalData?.type) {
      case GOAL_NODE_TYPE_GOAL:
        this.validateGoal(node, context, variablesList)
        break;
      case GOAL_NODE_TYPE_TASK:
        this.validateTask(node, context, variablesList)
        break;
      default:
        throw new Error('Type not specified')
        break;
    }


  }

  private manageVariablesList(variablesList: ObjectType, node: Node) {
    const { Controls } = node.goalData.customProperties
    if (Controls) {
      this.validateControlsProperty(Controls)

      getControlsVariablesList(Controls).forEach(variable => {
        const { identifier, type } = variable
        if (variablesList[identifier] !== undefined) {
          ErrorLogger.log(`Redeclaration of variable: ${identifier}`)
        }
        variablesList[identifier] = type
      })

    }
  }

  private manageContext(context: any, node: Node) {

  }

  private validateGoal(node: Node, context: any, variablesList: ObjectType) {
    this.validateGoalTextProperty(node.goalData.text)
    this.validateId(node.goalData.text, this.goalIdChecker())
    this.validateGoalType(node.goalData.customProperties.GoalType)

    this.validateCreationConditionProperty(node.goalData.customProperties.CreationCondition)

    const validateQueryGoal = () => {
      this.validateQueryGoalProperties(node.goalData.customProperties)
      this.validateQueryGoalQueriedProperty(node.goalData.customProperties, variablesList)
      this.validateNodeIsALeaf(node.children)
    }

    const validateAchieveGoal = () => {
      this.validateAchieveGoalProperties(node.goalData.customProperties)
      this.validateMonitorsProperty(node.goalData.customProperties.Monitors, variablesList)
      this.validateAchieveGoalAchieveCondition(node.goalData.customProperties, variablesList)
      this.validateNodeIsNotALeaf(node.children)
    }

    const { GoalType } = node.goalData.customProperties

    if (GoalType) {
      switch (GoalType) {
        case GOAL_TYPE_QUERY:
          validateQueryGoal()
          break;
        case GOAL_TYPE_ACHIEVE:
          validateAchieveGoal()
          break;
        case GOAL_TYPE_PERFORM:
          break
      }
    }
  }


  private validateTask(node: Node, context: any, variablesList: ObjectType) {
    this.validateId(node.goalData.text, this.taskIdChecker())
    this.validateTaskTextProperty(node.goalData.text)
    this.validateTaskProperties(node.goalData.customProperties)
    this.validateTaskNameHddlMap(node.goalData.text, this.hddl)
    // TODO - ver com Eric, parameters no HDDL e sem parameters no Model, só current_room
    // typeMap -> Map(1) { 'Room' => 'room' }
    //   'AT1' => Map(1) { 'current_room' => '?rm' },
    // possível mapear "current_room: Room" para rm - room
    // mas quem mapeia "?rt - robotteam" ??

    this.validateTaskVariablesMapOnHddl(node.goalData.text, this.hddl, variablesList, this.typesMap, this.tasksVarMap)

    // TODO - Validar se parent tem Monitor
    // console.log(this.typesMap)
    // console.log(this.tasksVarMap)
  }


}