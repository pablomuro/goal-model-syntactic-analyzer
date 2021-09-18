import { NodeCustomProperties } from './definitions/goal-model.types';
import { ErrorLogger } from './ErroLogger';
import { GoalTree, Node, NodeObject } from './GoalTree';
import { AchieveConditionGrammar } from './Grammars/AchieveConditionGrammar';
import { CreationConditionGrammar } from './Grammars/CreationConditionGrammar';
import { GoalTextPropertyGrammar } from './Grammars/GoalTextPropertyGrammar';
import { ControlsGrammar, MonitorsGrammar } from './Grammars/MonitorsAndControlsGrammar';
import { QueriedPropertyGrammar } from './Grammars/QueriedPropertyGrammar';
import { JisonParser } from './JisonParser';
import { ACHIEVED_CONDITION, CONTROLS, CREATION_CONDITION, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM, GOAL_TYPE_QUERY, MONITORS, QUERIED_PROPERTY, TASK_TYPE, WORLD_DB } from './utils/constants';
import { getControlsVariablesList, getMonitorsVariablesList, getTaskId, getTaskName, isVariableTypeSequence, ObjectType } from './utils/utils';

const eventListRegex = '[a-zA-Z_0-9]*(\s*,\s*[a-zA-Z_0-9])*'
const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'


const queriedPropertyJisonParser = new JisonParser(QueriedPropertyGrammar)
const goalTextPropertyJisonParser = new JisonParser(GoalTextPropertyGrammar)
const achieveConditionJisonParser = new JisonParser(AchieveConditionGrammar)
const monitorsJisonParser = new JisonParser(MonitorsGrammar)
const controlsJisonParser = new JisonParser(ControlsGrammar)
const creationConditionJisonParser = new JisonParser(CreationConditionGrammar)

export class ModelRulesValidator {
  tree: GoalTree
  typesMap: Map<string, string>
  tasksVarMap: Map<string, Map<string, string>>
  hddl: string

  currentNodeRef: { node: NodeObject }
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
    this.currentNodeRef = {
      node: { ...tree.root }
    }
    ErrorLogger.currentNodeRef = this.currentNodeRef

  }

  validateGoalTextProperty(nodeText: string) {
    const goalTextPropertyObj = goalTextPropertyJisonParser.parse(nodeText)
    if (!goalTextPropertyObj) return
  }

  validateTaskTextProperty(taskText: string) {
    const taskTextPropertyRegex = /^AT[0-9]+: (\w+\s*)+$/g

    if (!this.checkExactMatch(taskText, taskTextPropertyRegex)) {
      ErrorLogger.log('Bad Task Name Construction')
    }
  }

  validateId(nodeText: string, validId: string) {
    if (!nodeText.includes(`${validId}:`)) {
      ErrorLogger.log(`Bad ID sequence\nID should be: ${validId}`)
    }
  }

  validateGoalType(goalType: string | undefined) {
    const goalTypeList = [GOAL_TYPE_QUERY, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM]
    if (goalType && !goalTypeList.includes(goalType)) {
      ErrorLogger.log("Invalid GoalType")
    }
  }

  validateNodeIsALeaf(children: Node[]) {
    if (children.length != 0) {
      ErrorLogger.log('Node must be a leaf, but node has children')
    }
  }

  validateNodeIsNotALeaf(children: Node[]) {
    if (children.length == 0) {
      ErrorLogger.log('Node cannot be a leaf, but node has no children')
    }
  }

  validateQueryGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = [QUERIED_PROPERTY, CONTROLS]
    const cannotContains = [ACHIEVED_CONDITION]
    this.validateProperties(_properties, GOAL_TYPE_QUERY, requeridProperties, cannotContains)
  }

  validateQueryGoalQueriedProperty(properties: NodeCustomProperties, variablesList: ObjectType) {
    const queriedPropertyValue = properties.QueriedProperty

    if (!queriedPropertyValue) {
      ErrorLogger.log('No QueriedProperty value defined')
      return
    }

    const queriedPropertyObj = queriedPropertyJisonParser.parse(queriedPropertyValue)
    if (!queriedPropertyObj) return

    let { queriedVariable, queryVariable, variablesInCondition } = queriedPropertyObj

    if (variablesInCondition) {
      variablesInCondition.forEach((variable: string) => {
        if (!variable?.includes(queryVariable.value)) {
          ErrorLogger.log(`Query variable: "${queryVariable.value}" not equal to the variable: "${variable.split('.')[0]}" in the condition`)
        }
      })
    }

    if (queriedVariable !== WORLD_DB) {
      const variableType = variablesList[queriedVariable]
      if (variableType == undefined) {
        ErrorLogger.log(`Undeclared variable: ${queriedVariable} used in QueriedProperty`)
      } else {
        if (!queriedVariable.includes('.') && !isVariableTypeSequence(variableType)) {
          ErrorLogger.log('Query variable type is not a Sequence')
        }
      }
    }

    const controlsValue = properties.Controls
    if (controlsValue && getControlsVariablesList(controlsValue).length == 0) {
      ErrorLogger.log('Must be a variable in Controls to receive a QueriedProperty value')
    }
  }

  validateAchieveGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = [ACHIEVED_CONDITION, CONTROLS, MONITORS]
    const cannotContains = [QUERIED_PROPERTY]

    this.validateProperties(_properties, GOAL_TYPE_ACHIEVE, requeridProperties, cannotContains)
  }

  validateAchieveGoalAchieveCondition(properties: NodeCustomProperties, variablesList: ObjectType) {
    const achieveConditionValue = properties.AchieveCondition

    if (!achieveConditionValue) {
      // TODO - Essa condição ainda será validada, atualmente pode ser em Branco
      ErrorLogger.log('No AchieveCondition value defined')
      return
    }

    const achieveConditionObj = achieveConditionJisonParser.parse(achieveConditionValue)
    if (!achieveConditionObj) return

    if (achieveConditionObj.type == 'Normal') {
      checkControls(achieveConditionObj.variable.split('.')[0]);
      return
    }
    const { iteratedVariable, iterationVariable, variablesInCondition } = achieveConditionObj

    if (variablesInCondition) {
      variablesInCondition.forEach((variable: string) => {
        if (!variable?.includes(iterationVariable.value)) {
          ErrorLogger.log(`Iteration variable: "${iterationVariable.value}" not equal to the variable: "${variable.split('.')[0]}" in the condition`)
        }
      })
    }

    if (variablesList[iteratedVariable] == undefined) {
      ErrorLogger.log(`Iterated variable: ${iteratedVariable} is not instantiated`)
    }

    const variableType = variablesList[iteratedVariable]
    if (!iteratedVariable.includes('.') && variableType && !isVariableTypeSequence(variableType)) {
      ErrorLogger.log('Iterated variable type is not a Sequence')
    }

    const monitorsValue = properties.Monitors
    if (monitorsValue && !getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
      ErrorLogger.log(`Iterated variable: ${iteratedVariable} not present in monitored variables list`)
    }

    checkControls(iterationVariable.value);

    function checkControls(iterationVariable: any) {
      const controlsValue = properties.Controls;
      if (controlsValue && !getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
        ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in control variables list`);
      }
    }
  }

  validateTaskProperties(_properties: NodeCustomProperties) {
    const requeridProperties: string[] = []
    const cannotContains: string[] = [QUERIED_PROPERTY, ACHIEVED_CONDITION, CREATION_CONDITION]

    this.validateProperties(_properties, TASK_TYPE, requeridProperties, cannotContains)
  }

  validateTaskNameHddlMap(taskText: string, hddl: string) {
    const taskName = getTaskName(taskText)
    if (taskName) {
      const taskHddlDefinition = `(:task ${taskName}`

      if (!hddl.includes(taskHddlDefinition)) {
        ErrorLogger.log(`Task: ${taskName} not mapped on .hddl file`)
      }
    }
  }

  validateTaskVariablesMapOnHddl(taskText: string, hddl: string, variablesList: ObjectType, typesMap: Map<string, string>, tasksVarMap: Map<string, Map<string, string>>,) {
    // TODO - ver 
    const _type = variablesList['current_room']
    const taskId = getTaskId(taskText)
    if (_type && taskId) {
      const hddlVariableIdentifier = tasksVarMap.get(taskId)?.get('current_room')
      const hddlType = typesMap.get(_type)
      const hddlVariable = `${hddlVariableIdentifier} - ${hddlType}`
      // console.log(hddlVariable)
      // ErrorLogger.log('Types diferentes no HDDL')
    }

  }

  validateMonitorsProperty(monitorsValue: string | undefined, variablesList: ObjectType) {

    if (!monitorsValue) {
      ErrorLogger.log('No Monitors value defined')
      return
    }

    const monitorsObj = monitorsJisonParser.parse(monitorsValue)

    if (!monitorsObj) return

    const monitorsVariablesList = getMonitorsVariablesList(monitorsValue)
    // TODO
    console.log(monitorsObj)
    console.log(monitorsVariablesList)

    monitorsVariablesList.forEach(variable => {
      if (!variablesList[variable.identifier]) {
        ErrorLogger.log(`Variable: ${variable.identifier} used on Monitors is not instantiated`)
      }
    })

    // if (!this.checkExactMatch(monitorsValue, monitorsPropertyRegex)) {
    //   let errorMsg = `Bad Monitors Property Construction:\n`
    //   errorMsg += ` Variable(s) identifier or type, bad format\n`
    //   const monitorVariablesMatch = monitorsValue.match(new RegExp(`${variableIdentifierRegex}${optionalTypeRegex}`, 'g'))
    //   if (monitorVariablesMatch) {
    //     monitorsVariablesList.forEach(variable => {
    //       let badFormat = true;
    //       monitorVariablesMatch.forEach(matchVariable => {
    //         if (matchVariable.includes(variable.identifier)) {
    //           badFormat = false
    //           return
    //         }
    //       })
    //       if (badFormat) {
    //         errorMsg += ` Variable: ${variable.identifier} is bad formatted`
    //       }
    //     })
    //   }
    //   ErrorLogger.log(errorMsg)
    // }
  }
  validateControlsProperty(controlsValue: string | undefined) {

    if (!controlsValue) {
      ErrorLogger.log('No Controls value defined')
      return
    }

    const controlsObj = controlsJisonParser.parse(controlsValue)

    getControlsVariablesList(controlsValue).forEach(variable => {
      const { identifier, type } = variable
      if (!(identifier)) {
        ErrorLogger.log('Variable identifier in Controls property has an error')
      }
      if (!(type)) {
        ErrorLogger.log('Variable type in Controls property is required')
      }
    })

  }
  validateCreationConditionProperty(creationConditionValue: string | undefined) {
    if (!creationConditionValue) {
      return
    }
    const creationConditionObj = creationConditionJisonParser.parse('')
    if (!creationConditionObj) return

    let creationConditionRegex;
    if (creationConditionValue.includes('condition')) {
      creationConditionRegex = new RegExp(`assertion condition "(\\!|not )?${variableIdentifierRegex}"`, 'g')
      if (!this.checkExactMatch(creationConditionValue, creationConditionRegex)) {
        ErrorLogger.log('Bad CreationCondition Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }
    } else if (creationConditionValue.includes('trigger')) {
      creationConditionRegex = new RegExp(`assertion trigger "${eventListRegex}"`, 'g')
      if (!this.checkExactMatch(creationConditionValue, creationConditionRegex)) {
        ErrorLogger.log('Bad CreationCondition Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }
    } else {
      ErrorLogger.log(`Bad CreationCondition Construction, must includes 'assertion condition' or 'assertion trigger'`)
    }

  }
  private checkExactMatch(text: string, regex: RegExp | string, flag: string | undefined = undefined) {
    const newRegex = (flag) ? new RegExp(regex, flag) : new RegExp(regex)
    const match = text.match(newRegex)
    if (match != null && match[0] == text) {
      return true
    } else {
      return false
    }
  }

  private validateProperties(_properties: NodeCustomProperties, nodeType: string, requeridProperties: string[], cannotContains: string[]) {
    requeridProperties.forEach(requeridProperty => {
      if (!_properties.hasOwnProperty(requeridProperty)) {
        ErrorLogger.log(`Property: ${requeridProperty} is required on type: ${nodeType}`)
      }
    })

    cannotContains.forEach(cannotContainProperty => {
      if (_properties.hasOwnProperty(cannotContainProperty)) {
        ErrorLogger.log(`Node type: ${nodeType} cannot contain the property: ${cannotContainProperty}`)
      }
    })
  }
}
