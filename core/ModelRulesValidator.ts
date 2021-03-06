import { Config } from './definitions/config.types';
import { NodeCustomProperties } from './definitions/goal-model.types';
import { ErrorLogger } from './ErroLogger';
import { GoalTree, Node, NodeObject } from './GoalTree';
import { AchieveConditionGrammar, UniversalAchieveConditionGrammar } from './Grammars/AchieveConditionGrammar';
import { ContextGrammar, TriggerGrammar, ConditionGrammar } from './Grammars/ContextGrammar'
import { GoalTextPropertyGrammar } from './Grammars/GoalTextPropertyGrammar';
import { TaskTextPropertyGrammar } from './Grammars/TaskTextPropertyGrammar';
import { ControlsGrammar, MonitorsGrammar } from './Grammars/MonitorsAndControlsGrammar';
import { QueriedPropertyGrammar } from './Grammars/QueriedPropertyGrammar';
import { LocationGrammar, ParamsGrammar, RobotNumberGrammar } from './Grammars/TaskGrammar'
import { JisonParser } from './JisonParser';
import { ACHIEVED_CONDITION, CONTROLS, CONTEXT, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM, GOAL_TYPE_QUERY, MONITORS, ONE_ROBOT, QUERIED_PROPERTY, TASK_TYPE, WORLD_DB, GROUP_FALSE, TRIGGER, CONDITION, UNIVERSAL_ACHIEVED_CONDITION } from './utils/constants';
import { getControlsVariablesList, getMonitorsVariablesList, getPlainMonitorsVariablesList, getTaskId, getTaskName, getTaskVariablesList, isVariableTypeSequence, ObjectType } from './utils/utils';

const queriedPropertyJisonParser = new JisonParser(QueriedPropertyGrammar)
const goalTextPropertyJisonParser = new JisonParser(GoalTextPropertyGrammar)
const achieveConditionJisonParser = new JisonParser(AchieveConditionGrammar)
const universalAchieveConditionJisonParser = new JisonParser(UniversalAchieveConditionGrammar)
const monitorsJisonParser = new JisonParser(MonitorsGrammar)
const controlsJisonParser = new JisonParser(ControlsGrammar)
const contextJisonParser = new JisonParser(ContextGrammar)
const triggerJisonParser = new JisonParser(TriggerGrammar)
const conditionJisonParser = new JisonParser(ConditionGrammar)
const taskTextPropertyJisonParser = new JisonParser(TaskTextPropertyGrammar)
const taskLocationJisonParser = new JisonParser(LocationGrammar)
const taskParamsJisonParser = new JisonParser(ParamsGrammar)
const taskRobotNumberJisonParser = new JisonParser(RobotNumberGrammar)

export class ModelRulesValidator {
  tree: GoalTree
  typesMap: Map<string, string>
  tasksVarMap: Map<string, Map<string, string>>
  hddl: string
  configFile: Config

  currentNodeRef: { node: NodeObject }
  constructor(
    tree: GoalTree,
    typesMap: Map<string, string>,
    tasksVarMap: Map<string, Map<string, string>>,
    hddl: string,
    configFile: Config
  ) {
    this.tree = tree
    this.tasksVarMap = tasksVarMap
    this.typesMap = typesMap
    this.hddl = hddl
    this.configFile = configFile
    this.currentNodeRef = {
      node: { ...tree.root }
    }
    ErrorLogger.currentNodeRef = this.currentNodeRef

  }

  validateGoalTextProperty(nodeText: string) {
    if (!nodeText) {
      ErrorLogger.log('Goal Name is required')
      return
    }
    const goalTextPropertyObj = goalTextPropertyJisonParser.parse(nodeText)
    if (!goalTextPropertyObj) return
  }

  validateTaskTextProperty(taskText: string) {
    if (!taskText) {
      ErrorLogger.log('Task Name is required')
      return
    }
    taskTextPropertyJisonParser.parse(taskText)
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
    const cannotContains = [ACHIEVED_CONDITION, UNIVERSAL_ACHIEVED_CONDITION]
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

    let { queriedVariable, queryVariable, variablesInCondition }: {
      queriedVariable: any, queryVariable: any, variablesInCondition: string[]
    } = queriedPropertyObj

    if (variablesInCondition.length) {

      const oclQueryVariable = variablesInCondition.filter((variable: string) => variable == queryVariable.value)
      if (!oclQueryVariable.length) {
        ErrorLogger.log(`Query variable: ${queryVariable.value} not used in the OCL instruction`)
      } else if (oclQueryVariable.length == 1) {
        const variableToCheck = variablesInCondition.find((variable: string) => variable !== queryVariable.value)
        if (variableToCheck && variablesList[variableToCheck] == undefined) {
          ErrorLogger.log(`Undeclared variable: ${variableToCheck} used in QueriedProperty OCL instruction`)
        }
      }
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
    const requeridProperties = [CONTROLS, MONITORS]
    const cannotContains = [QUERIED_PROPERTY]

    this.validateProperties(_properties, GOAL_TYPE_ACHIEVE, requeridProperties, cannotContains)
  }

  validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(properties: NodeCustomProperties, variablesList: ObjectType) {
    const achieveConditionValue = properties.AchieveCondition
    const universalAchieveConditionValue = properties.UniversalAchieveCondition

    const valid = this.validateDoubleRequiredProperties(properties, GOAL_TYPE_ACHIEVE, ACHIEVED_CONDITION, UNIVERSAL_ACHIEVED_CONDITION)
    if (!valid) {
      ErrorLogger.log('Validation of double properties skipped')
      return
    }

    let achieveConditionObj;

    if (achieveConditionValue) {
      achieveConditionObj = achieveConditionJisonParser.parse(achieveConditionValue)
    }
    if (universalAchieveConditionValue) {
      achieveConditionObj = universalAchieveConditionJisonParser.parse(universalAchieveConditionValue)
    } else if (properties.hasOwnProperty(UNIVERSAL_ACHIEVED_CONDITION)) {
      ErrorLogger.log('UniversalAchieveCondition must have a value')
    }

    if (!achieveConditionObj) return

    if (achieveConditionObj.type == 'Normal') {
      checkControls(achieveConditionObj.variable.split('.')[0]);
      return
    }

    const { iteratedVariable, iterationVariable, variablesInCondition }: {
      iteratedVariable: any, iterationVariable: any, variablesInCondition: string[]
    } = achieveConditionObj

    if (variablesInCondition.length) {
      const oclIterationVariable = variablesInCondition.filter((variable: string) => variable == iterationVariable.value)
      if (!oclIterationVariable.length) {
        ErrorLogger.log(`Iteration variable: ${iterationVariable.value} not used in the OCL instruction`)
      } else if (oclIterationVariable.length == 1) {
        const variableToCheck = variablesInCondition.find((variable: string) => variable !== iterationVariable.value)
        if (variableToCheck && variablesList[variableToCheck] == undefined) {
          ErrorLogger.log(`Undeclared variable: ${variableToCheck} used in UniversalAchieveCondition OCL instruction`)
        }
      }
    }

    if (variablesList[iteratedVariable] == undefined) {
      ErrorLogger.log(`Iterated variable: ${iteratedVariable} was not previous instantiated`)
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
    const cannotContains: string[] = [QUERIED_PROPERTY, ACHIEVED_CONDITION, UNIVERSAL_ACHIEVED_CONDITION, CONTEXT]

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

  validateTaskVariablesMapOnHddl(properties: NodeCustomProperties, taskText: string, variablesList: ObjectType, parentGoalIsGroupFalse: boolean) {

    const taskName = getTaskName(taskText)
    const taskVariables = getTaskVariablesList(properties)

    const hddlTaskRegex = `\\(:task ${taskName}\.*\\)`
    const match = this.hddl.toString().match(new RegExp(hddlTaskRegex, 'g'))

    if (match != null && match[0]) {
      const hddlParametersString = match[0].split(':parameters')[1].trim().toString()
      taskVariables.forEach(variable => {
        const type = variablesList[variable]
        const taskId = getTaskId(taskText)
        if (type && taskId) {
          const hddlVariableIdentifier = this.tasksVarMap.get(taskId)?.get(variable)
          const hddlType = this.typesMap.get(type)

          const hddlVariable = `${hddlVariableIdentifier} - ${hddlType}`

          if (!hddlVariableIdentifier || !hddlType) {
            ErrorLogger.log(`Task variable: ${variable}: ${type} not mapped on task ${taskName} in the HDDL file`)
          } else if (!hddlParametersString.includes(hddlVariable)) {
            ErrorLogger.log(`Task variable: ${variable}: ${type} not mapped as ${hddlVariable} in the HDDL file`)
          }
        }
      })
      this.validateTaskRobotsOnHddl(properties, hddlParametersString, parentGoalIsGroupFalse)
    }
  }

  validateTaskRobotsOnHddl(taskProperties: NodeCustomProperties, hddlParametersString: string, parentGoalIsGroupFalse: boolean) {
    const robotRegex = /(robot)(\s|\))/g
    const robotTeamRegex = /(robotteam)(\s|\))/g

    const hasRobotTeam = (hddlParametersString.match(new RegExp(robotTeamRegex)) != null)

    const hddlRobotCountMatch = hddlParametersString.match(new RegExp(robotRegex))

    if (taskProperties.RobotNumber) {
      const robotNumberObj = taskRobotNumberJisonParser.parse(taskProperties.RobotNumber)
      if (robotNumberObj) {
        if (parentGoalIsGroupFalse) {
          try {
            if (robotNumberObj.type === 'RANGE') {
              const minRobotNumber = robotNumberObj.value[0]
              if (minRobotNumber != ONE_ROBOT) throw `Range: [${robotNumberObj.value.join(",")}] must start with ${ONE_ROBOT}`
            } else {
              if (!hddlRobotCountMatch) throw 'None "robot" variable defined in the Task HDDL definition'
              const hddlRobotCount = hddlRobotCountMatch.length
              if (hddlRobotCount != parseInt(ONE_ROBOT)) throw `Just one "robot" variable must be defined in HDDL definition, got ${hddlRobotCount}`
            }
          } catch (errorMessage: any) {
            ErrorLogger.log(
              `Task with a Non Group Parent must have 1 "robot" variable in its declaration or a RobotNumber attribute with 1 present in the range\n ->${errorMessage ? errorMessage : ''}`
            )
          }
        }

        if (robotNumberObj.type && !hasRobotTeam) {
          if (robotNumberObj.type === 'RANGE') {
            robotNumberObj.value = robotNumberObj.value[1]
          }
          try {
            if (!hddlRobotCountMatch) throw new Error

            const hddlRobotCount = hddlRobotCountMatch.length
            if (parseInt(robotNumberObj.value) != hddlRobotCount) {
              throw new Error
            }
          } catch (e) {
            const errorMessageType = (robotNumberObj.type === 'RANGE') ? 'a max range of' : 'value'
            ErrorLogger.log(`RobotNumber with ${errorMessageType}: ${robotNumberObj.value} must map ${robotNumberObj.value} "robots" or a "robotteam" variable in the HDDL definition`);
          }
        }
      }
    } else if (!taskProperties.RobotNumber && hasRobotTeam) {
      ErrorLogger.log(`Tasks without a RobotNumber attribute cannot have a "robotteam" variable in the HDDL definition`)
    }
  }

  validateIfTaskParentHasMonitors(parentProperties: NodeCustomProperties | undefined, taskProperties: NodeCustomProperties) {
    const taskHasVariables = taskProperties.Params || taskProperties.Location
    if (!parentProperties) {
      ErrorLogger.log('Task must have a Parent');
    }
    else if (taskHasVariables && !('Monitors' in parentProperties)) {
      ErrorLogger.log('Task parent must have a Monitors property')
    }
  }

  validateTaskPropertiesVariablesWithParentMonitors(parentProperties: NodeCustomProperties, taskProperties: NodeCustomProperties, instantiatedVariablesList: ObjectType) {
    const variablesList: string[] = []

    if (taskProperties.Location) {
      const locationVariable = taskLocationJisonParser.parse(taskProperties.Location)
      if (locationVariable) {
        variablesList.push(locationVariable)
        const locationVariableType = instantiatedVariablesList[locationVariable]
        if (!locationVariableType) {
          ErrorLogger.log(`Location variable: ${locationVariable} does not have a Type`)
        } else if (!this.configFile.location_types.includes(locationVariableType)) {
          ErrorLogger.log(`Location variable type: ${locationVariableType} is not declared in location_types on the config file`)
        }
      }
    }
    if (taskProperties.Params) {
      const paramsVariables = taskParamsJisonParser.parse(taskProperties.Params)
      if (paramsVariables)
        variablesList.push(...paramsVariables)
    }
    if (taskProperties.RobotNumber) {
      const robotNumberObj = taskRobotNumberJisonParser.parse(taskProperties.RobotNumber)
      if (robotNumberObj && robotNumberObj.type === 'RANGE') {
        const [minRobot, maxRobot] = robotNumberObj.value
        if ((minRobot && maxRobot) && (parseInt(minRobot) > parseInt(maxRobot))) {
          ErrorLogger.log(`RobotNumber Range: minimum robot number is grater than the maximum number`);
        }
      }
    }

    if (variablesList && parentProperties.Monitors) {
      const monitorsVariablesList = getPlainMonitorsVariablesList(parentProperties.Monitors)

      variablesList.forEach((variable: string) => {
        if (!monitorsVariablesList.includes(variable)) {
          ErrorLogger.log(`Task Variable: ${variable} not present in parent Monitors property`)
        }
        if (!instantiatedVariablesList[variable]) {
          ErrorLogger.log(`Task Variable: ${variable} was not previous instantiated`)
        }
      })
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

    monitorsVariablesList.forEach(variable => {
      if (!variablesList[variable.identifier]) {
        ErrorLogger.log(`Variable: ${variable.identifier} used on Monitors was not previous instantiated`)
      }
    })
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
  validateContextProperty(properties: NodeCustomProperties) {
    const { Context } = properties
    if (!Context) {
      return
    }

    const { contextType } = contextJisonParser.parse(Context)
    if (!contextType) return

    if (contextType == TRIGGER) {
      this.validateProperties(properties, CONTEXT, [TRIGGER], [])
      const valid = this.validateDoubleRequiredProperties(properties, CONTEXT, TRIGGER, CONDITION)
      if (!valid)
        ErrorLogger.log(`Node type: ${CONTEXT} with the value ${TRIGGER} must have a ${TRIGGER} property`)
      const { Trigger } = properties
      if (Trigger) {
        const triggerObj = triggerJisonParser.parse(Trigger)
      }
    } else if (contextType == CONDITION) {
      this.validateProperties(properties, CONTEXT, [CONDITION], [])
      const valid = this.validateDoubleRequiredProperties(properties, CONTEXT, TRIGGER, CONDITION)
      if (!valid)
        ErrorLogger.log(`Node type: ${CONTEXT} with the value ${CONDITION} must have a ${CONDITION} property`)
      const { Condition } = properties
      if (Condition) {
        const conditionObj = conditionJisonParser.parse(Condition)
      }
    }

  }

  // ============ aux methods  ================= //

  protected parentGoalIsGroupFalse(parentProperties: NodeCustomProperties) {
    return (parentProperties.Group && parentProperties.Group === GROUP_FALSE) ? true : false
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

  private validateDoubleRequiredProperties(
    _properties: NodeCustomProperties,
    nodeType: string,
    firstProperty: string, secondProperty: string
  ) {
    const hasFirstProperty = _properties.hasOwnProperty(firstProperty);
    const hasSecondProperty = _properties.hasOwnProperty(secondProperty);
    if (hasFirstProperty && hasSecondProperty) {
      ErrorLogger.log(`Node type: ${nodeType} cannot contain the property: ${firstProperty} and ${secondProperty} at the same time`)
      return false
    }
    return true
  }
}
