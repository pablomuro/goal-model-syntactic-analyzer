import { GOAL_NODE_TYPE_GOAL, GOAL_NODE_TYPE_TASK, GOAL_TYPE_QUERY, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM } from './constants';
import { GoalTree, Node } from './GoalTree';
import { ModelRulesValidator } from './ModelRulesValidator';
import { getControlsVariablesList, ObjectType } from './utils';
export class ModelValidator {
  tree: GoalTree
  typesMap: Map<string, string>
  tasksVarMap: Map<string, Map<string, string>>
  hddl: string

  errorList = []

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
    this.tree = tree
    this.tasksVarMap = tasksVarMap
    this.typesMap = typesMap
    this.hddl = hddl

    this.goalIdChecker = this.idChecker(this.GOAL_ID)
    this.taskIdChecker = this.idChecker(this.TASK_ID)
  }

  resetValidator() {
    this.goalIdChecker = this.idChecker(this.GOAL_ID)
    this.taskIdChecker = this.idChecker(this.TASK_ID)
  }

  validateModel() {
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

    return visited;
  }
  private validateNode(node: Node, context: any, variablesList: ObjectType) {
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
      ModelRulesValidator.validateControlsProperty(Controls)

      getControlsVariablesList(Controls).forEach(variable => {
        const { identifier, type } = variable
        if (variablesList[identifier] !== undefined) {
          // TODO - erro redefinição de variavel
          console.error('erro redefinição de variável')
        }
        variablesList[identifier] = type
      })

    }
  }

  private manageContext(context: any, node: Node) {

  }

  private validateGoal(node: Node, context: any, variablesList: ObjectType) {
    ModelRulesValidator.validateGoalTextProperty(node.goalData.text)
    ModelRulesValidator.validateId(node.goalData.text, this.goalIdChecker())
    ModelRulesValidator.validateGoalType(node.goalData.customProperties.GoalType)

    ModelRulesValidator.validateCreationConditionProperty(node.goalData.customProperties.CreationCondition)

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

    function validateQueryGoal() {
      ModelRulesValidator.validateQueryGoalProperties(node.goalData.customProperties)
      ModelRulesValidator.validateQueryGoalQueriedProperty(node.goalData.customProperties, variablesList)
      ModelRulesValidator.validateNodeIsALeaf(node.children)
    }

    function validateAchieveGoal() {
      ModelRulesValidator.validateAchieveGoalProperties(node.goalData.customProperties)
      ModelRulesValidator.validateMonitorsProperty(node.goalData.customProperties.Monitors, variablesList)
      ModelRulesValidator.validateAchieveGoalAchieveCondition(node.goalData.customProperties, variablesList)
      ModelRulesValidator.validateNodeIsNotALeaf(node.children)
    }
  }


  private validateTask(node: Node, context: any, variablesList: ObjectType) {
    ModelRulesValidator.validateId(node.goalData.text, this.taskIdChecker())
    ModelRulesValidator.validateTaskTextProperty(node.goalData.text)
    ModelRulesValidator.validateTaskProperties(node.goalData.customProperties)
  }


}