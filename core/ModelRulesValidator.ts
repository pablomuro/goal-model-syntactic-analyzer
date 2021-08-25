import { ErrorLogger } from './ErroLogger';
import { GOAL_TYPE_QUERY, GOAL_TYPE_PERFORM, GOAL_TYPE_ACHIEVE, QUERIED_PROPERTY, CONTROLS, ACHIEVED_CONDITION, MONITORS, CREATION_CONDITION, WORLD_DB, TASK_TYPE } from './utils/constants';
import { getControlsVariablesList, ObjectType, isVariableTypeSequence, getMonitorsVariablesList, getTaskName, getTaskId } from './utils/utils';
import { NodeCustomProperties } from './definitions/goal-model.types';
import { GoalTree, Node, NodeObject } from './GoalTree';

const eventListRegex = '[a-zA-Z_0-9]*(\s*,\s*[a-zA-Z_0-9])*'
const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const notRegex = '\\!?'

const queryGoalConditionOr =
  `${notRegex}${variableIdentifierRegex} ((=|<>) ("[a-zA-Z]+"|[0-9.]+)|(>|<)=? [0-9.]+|(in|&&|\\|\\|) ${notRegex}${variableIdentifierRegex})`
const queryGoalConditionRegex = `(${notRegex}${variableIdentifierRegex}|${queryGoalConditionOr}|)`

const achieveGoalConditionOr = `(${notRegex}${variableIdentifierRegex} (=|<>|(>|<)=?) ([0-9.]+)|(&&|\\|\\|) ${notRegex}${variableIdentifierRegex})`
const achieveGoalConditionRegex = `(${notRegex}${variableIdentifierRegex}|${achieveGoalConditionOr}|)`

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
    const goalTextPropertyRegex = /^G[0-9]+:\s*(\w*\s*(?!FALLBACK))*(([G[0-9]+(;|\#)G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g

    if (!this.checkMatch(nodeText, goalTextPropertyRegex)) {
      ErrorLogger.log('Bad Goal Name Construction')
      // TODO - Erros via match vão ter q ser feitos novos regex
      // caso necessário refinamento do erro
    }
  }

  validateTaskTextProperty(taskText: string) {
    const taskTextPropertyRegex = /^AT[0-9]+: (\w+\s*)+$/g

    if (!this.checkMatch(taskText, taskTextPropertyRegex)) {
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
    const queriedPropertyRegex = new RegExp(`^${variableIdentifierRegex}->select\\(${variableIdentifierRegex}:${variableTypeRegex} \\|\\s*${queryGoalConditionRegex}\\)$`, 'g')

    if (queriedPropertyValue) {
      const match = queriedPropertyValue.match(new RegExp(queriedPropertyRegex))
      console.log(match)
      if (!this.checkMatch(queriedPropertyValue, queriedPropertyRegex)) {
        ErrorLogger.log('Bad QueriedProperty Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      const matchGroupList = new RegExp(queriedPropertyRegex).exec(queriedPropertyValue)
      if (matchGroupList) {
        let [_, queriedVariable, queryVariable, queryVariableInCondition] = matchGroupList
        queryVariableInCondition = queryVariableInCondition.split('.')[0]
        if (queryVariable != queryVariableInCondition) {
          ErrorLogger.log(`Query variable: ${queryVariable} not equal to the variable:${queryVariableInCondition} in the condition`)
        }

        // TODO - ver depois questão do sequence anotado
        if (queriedVariable !== WORLD_DB && variablesList[queriedVariable] == undefined) {
          ErrorLogger.log(`Undeclared variable: ${queriedVariable} used in QueriedProperty`)
        }

        const controlsValue = properties.Controls
        if (controlsValue && getControlsVariablesList(controlsValue).length == 0) {
          ErrorLogger.log('Must be a variable in Controls to receive a QueriedProperty value')
        }
      }
    } else {
      ErrorLogger.log('No QueriedProperty value defined')
    }
  }

  validateAchieveGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = [ACHIEVED_CONDITION, CONTROLS, MONITORS]
    const cannotContains = [QUERIED_PROPERTY]

    this.validateProperties(_properties, GOAL_TYPE_ACHIEVE, requeridProperties, cannotContains)
  }

  validateAchieveGoalAchieveCondition(properties: NodeCustomProperties, variablesList: ObjectType) {
    const achieveConditionValue = properties.AchieveCondition
    const achieveConditionUniversalRegex = new RegExp(`^${variableIdentifierRegex}->forAll\\(${variableIdentifierRegex}(?::${variableTypeRegex})? \\| ${achieveGoalConditionRegex}\\)$`, 'g')
    const achieveConditionRegex = new RegExp('')

    if (achieveConditionValue) {
      const testAchieveConditionRegex = (achieveConditionValue.includes('->forAll') ? achieveConditionUniversalRegex : achieveConditionRegex)
      // TODO - achieveCondition expressão normal é somente o Fi
      if (!this.checkMatch(achieveConditionValue, testAchieveConditionRegex)) {
        ErrorLogger.log('Bad AchieveCondition Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      if (!achieveConditionValue.includes('->forAll')) return

      const matchGroupList = new RegExp(testAchieveConditionRegex).exec(achieveConditionValue)
      if (matchGroupList) {
        let [_, iteratedVariable, iterationVariable, iterationVariableInCondition] = matchGroupList

        iterationVariableInCondition = iterationVariableInCondition.split('.')[0]
        if (iterationVariable != iterationVariableInCondition) {
          ErrorLogger.log(`Iteration variable: ${iterationVariable} not equal to the variable:${iterationVariableInCondition} in the condition`)
        }

        if (variablesList[iteratedVariable] == undefined) {
          ErrorLogger.log(`Iterated variable: ${iteratedVariable} is not instantiated`)
        }

        // TODO - Sequence 
        const variableType = variablesList[iteratedVariable]
        if (variableType && !isVariableTypeSequence(variableType)) {
          ErrorLogger.log('Iterated variable type is not a Sequence')
        }

        const monitorsValue = properties.Monitors
        if (monitorsValue && !getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
          ErrorLogger.log(`Iterated variable: ${iteratedVariable} not present in monitored variables list`)
        }

        const controlsValue = properties.Controls
        if (controlsValue && !getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
          ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in control variables list`)
        }
      }
    } else {
      // TODO - Essa condição ainda será validada, atualmente pode ser em Branco
      ErrorLogger.log('No AchieveCondition value defined')
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
    if (monitorsValue) {
      const optionalTypeRegex = `( : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))?`
      const monitorsPropertyRegex = new RegExp(`^(${variableIdentifierRegex}${optionalTypeRegex})( , (${variableIdentifierRegex}${optionalTypeRegex}))*$`, 'g')
      if (!this.checkMatch(monitorsValue, monitorsPropertyRegex)) {
        ErrorLogger.log('Bad Monitors Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      getMonitorsVariablesList(monitorsValue).forEach(variable => {
        if (!variablesList[variable.identifier]) {
          ErrorLogger.log(`Variable: ${variable.identifier} used on Monitors has not instantiated`)
        }
      })
    } else {
      ErrorLogger.log('No Monitors value defined')
    }
  }
  validateControlsProperty(controlsValue: string | undefined) {
    if (controlsValue) {
      // TODO - Questão de Sequence, validar futuramente
      const controlsPropertyRegex = new RegExp(`^(${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))( , (${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex})))*$`, 'g')
      if (!this.checkMatch(controlsValue, controlsPropertyRegex)) {
        ErrorLogger.log('Bad Controls Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      getControlsVariablesList(controlsValue).forEach(variable => {
        const { identifier, type } = variable
        if (!(identifier)) {
          ErrorLogger.log('Variable identifier in Controls property has an error')
        }
        if (!(type)) {
          ErrorLogger.log('Variable type in Controls property is required')
        }
      })
    } else {
      ErrorLogger.log('No Controls value defined')
    }
  }
  validateCreationConditionProperty(creationConditionValue: string | undefined) {
    if (creationConditionValue) {
      let creationConditionRegex;
      if (creationConditionValue.includes('condition')) {
        creationConditionRegex = new RegExp(`assertion condition "(\\!|not )?${variableIdentifierRegex}"`, 'g')
        if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
          ErrorLogger.log('Bad CreationCondition Construction')
          // TODO - se erro, falar qual erro, ver groups e oq ta faltando
        }
      } else if (creationConditionValue.includes('trigger')) {
        creationConditionRegex = new RegExp(`assertion trigger "${eventListRegex}"`, 'g')
        if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
          ErrorLogger.log('Bad CreationCondition Construction')
          // TODO - se erro, falar qual erro, ver groups e oq ta faltando
        }
      } else {
        ErrorLogger.log(`Bad CreationCondition Construction, must includes 'assertion condition' or 'assertion trigger'`)
      }

    }
  }
  private checkMatch(text: string, regex: RegExp) {
    const match = text.match(new RegExp(regex))
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
