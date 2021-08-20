import { ErrorLogger } from './ErroLogger';
import { GOAL_TYPE_QUERY, GOAL_TYPE_PERFORM, GOAL_TYPE_ACHIEVE, QUERIED_PROPERTY, CONTROLS, ACHIEVED_CONDITION, MONITORS, CREATION_CONDITION, WORLD_DB, TASK_TYPE } from './utils/constants';
import { getControlsVariablesList, ObjectType, isVariableTypeSequence, getMonitorsVariablesList, getTaskName, getTaskId } from './utils/utils';
import { NodeCustomProperties } from './definitions/goal-model.types';
import { GoalTree, Node, NodeObject } from './GoalTree';

const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const queryGoalConditionOr = `( (=|<>) ("[a-zA-Z]+"|[0-9.]+)| (>|<)=? [0-9.]+| ${variableIdentifierRegex} in ${variableIdentifierRegex}|)`
const queryGoalConditionRegex = `\\!?${variableIdentifierRegex}${queryGoalConditionOr}`

const achieveGoalConditionOr = `( (=|<>|(>|<)=?) ([0-9.]+)|)`
const achieveGoalConditionRegex = `\\!?${variableIdentifierRegex}${achieveGoalConditionOr}`

export class ModelRulesValidator {
  tree: GoalTree
  typesMap: Map<string, string>
  tasksVarMap: Map<string, Map<string, string>>
  hddl: string

  errorList = []

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
    this.errorList = []
    this.currentNodeRef = {
      node: { ...tree.root }
    }
    ErrorLogger.currentNodeRef = this.currentNodeRef

  }

  validateGoalTextProperty(nodeText: string) {
    const goalTextPropertyRegex = /^G[0-9]+: (\w*\s*)*(([G[0-9]+;G[0-9]+])|([G[0-9]+\#G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g

    if (!this.checkMatch(nodeText, goalTextPropertyRegex)) {
      ErrorLogger.log('Bad Goal Name Construction')
      // TODO - se erro, falar qual erro, ver groups e oq ta faltando
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
    const queriedPropertyRegex = new RegExp(`^${variableIdentifierRegex}->select\\(${variableIdentifierRegex}:${variableTypeRegex} \\| ${queryGoalConditionRegex}\\)$`, 'g')

    if (queriedPropertyValue) {
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

        // TODO - ver se variavel tem q ser uma Sequencie
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
    const achieveConditionRegex = new RegExp(`^${variableIdentifierRegex}->forAll\\(${variableIdentifierRegex}(?::${variableTypeRegex})? \\| ${achieveGoalConditionRegex}\\)$`, 'g')

    if (achieveConditionValue) {
      // TODO - achieveCondition tem que ter 2 tipos de expressão, uma Normal ou usando forAll
      // ver com o Eric como que é uma normal
      if (!this.checkMatch(achieveConditionValue, achieveConditionRegex)) {
        ErrorLogger.log('Bad AchieveCondition Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      const matchGroupList = new RegExp(achieveConditionRegex).exec(achieveConditionValue)
      if (matchGroupList) {
        let [_, iteratedVariable, iterationVariable, iterationVariableInCondition] = matchGroupList

        iterationVariableInCondition = iterationVariableInCondition.split('.')[0]
        if (iterationVariable != iterationVariableInCondition) {
          ErrorLogger.log(`Iteration variable: ${iterationVariable} not equal to the variable:${iterationVariableInCondition} in the condition`)
        }

        if (variablesList[iteratedVariable] == undefined) {
          ErrorLogger.log(`Iterated variable: ${iteratedVariable} is not instantiated`)
        }

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
          ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in monitored variables list`)
        }
      }
    } else {
      ErrorLogger.log('No AchieveCondition value defined')
    }
  }

  validateTaskProperties(_properties: NodeCustomProperties) {
    // TODO - ver Propriedades Required e Cannot
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
      // TODO - Verificar com Eric regex do controls value, controls pode ser uma lista 
      const controlsPropertyRegex = new RegExp(`^(${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))( , (${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex})))*$`, 'g')
      if (!this.checkMatch(controlsValue, controlsPropertyRegex)) {
        ErrorLogger.log('Bad Controls Construction')
        // TODO - se erro, falar qual erro, ver groups e oq ta faltando
      }

      getControlsVariablesList(controlsValue).forEach(variable => {
        const { identifier, type } = variable
        if (!(identifier)) {
          ErrorLogger.log('Variable in Controls property error')
        }
        if (!(type)) {
          ErrorLogger.log('Variable Type in Controls property is required')
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
        // TODO - Eric, ver regex para a lista de eventos de trigger
        creationConditionRegex = new RegExp(`assertion trigger ""`, 'g')
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
