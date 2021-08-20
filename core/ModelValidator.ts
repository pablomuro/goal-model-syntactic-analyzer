import { getControlsVariable, ObjectType } from './utils';
import { ModelRulesValidator } from './ModelRulesValidator';
import { GoalTree, Node } from './GoalTree';
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
      case 'istar.Goal':
        this.validateGoal(node, context, variablesList)
        break;
      case 'istar.Task':
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
      const { identifier, type } = getControlsVariable(Controls)
      variablesList[identifier] = type
      console.log(Controls)
    }
  }

  private manageContext(context: any, node: Node) {

  }

  private validateGoal(node: Node, context: any, variablesList: ObjectType) {
    // console.log('validating Goal')
    ModelRulesValidator.validateGoalTextProperty(node.goalData.text)
    ModelRulesValidator.validateId(node.goalData.text, this.goalIdChecker())

    const { GoalType } = node.goalData.customProperties
    if (GoalType) {
      switch (GoalType) {
        case 'Query':
          validateQueryGoal()
          break;
        case 'Achieve':
          validateAchieveGoal()
          break;
        case 'Perform':
          break
        default:
          throw new Error('Type not specified')
          break;
      }
    }

    function validateQueryGoal() {
      ModelRulesValidator.validateQueryGoalProperties(node.goalData.customProperties)
      // TODO - Validando já no parce de variaveis
      // ModelRulesValidator.validateControlsProperty(node.goalData.customProperties.Controls)
      ModelRulesValidator.validateQueryGoalQueriedProperty(node.goalData.customProperties)
      // TODO - validar customProperties que não podem estar no Query
      // linha 115 gm.cpp
    }

    function validateAchieveGoal() {

    }
  }


  private validateTask(node: Node, context: any, variablesList: ObjectType) {
    // console.log('validating Task')
  }


}