import { GOAL_TYPE_QUERY, GOAL_TYPE_PERFORM, GOAL_TYPE_ACHIEVE, QUERIED_PROPERTY, CONTROLS, ACHIEVED_CONDITION, MONITORS, CREATION_CONDITION } from './constants';
import { getControlsVariablesList, ObjectType, isVariableTypeSequence, getMonitorsVariablesList } from './utils';
import { NodeCustomProperties } from './definitions/goal-model.types';
import { GoalTree, Node } from './GoalTree';

const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*'
const queryGoalConditionOr = `( (=|<>) ("[a-zA-Z]+"|[0-9.]+)| (>|<)=? [0-9.]+| ${variableIdentifierRegex} in ${variableIdentifierRegex}|)`
const queryGoalConditionRegex = `\\!?${variableIdentifierRegex}${queryGoalConditionOr}`

const achieveGoalConditionOr = `( (=|<>|(>|<)=?) ([0-9.]+)|)`
const achieveGoalConditionRegex = `\\!?${variableIdentifierRegex}${achieveGoalConditionOr}`

export class ModelRulesValidator {

  static validateGoalTextProperty(nodeText: string) {
    const goalTextPropertyRegex = /^G[0-9]+: (\w*\s*)*(([G[0-9]+;G[0-9]+])|([G[0-9]+\#G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g

    if (!this.checkMatch(nodeText, goalTextPropertyRegex)) {
      // TODO - Mostrar erro no nome
      console.error('error')
    }
  }

  static validateTaskTextProperty(taskText: string) {
    const taskTextPropertyRegex = /^AT[0-9]+: (\w+\s*)+$/g

    if (!this.checkMatch(taskText, taskTextPropertyRegex)) {
      // TODO - Mostrar erro no nome
      console.error('error')
    }
  }

  static validateId(nodeText: string, validId: string) {
    if (!nodeText.includes(validId)) {
      // TODO - Mostrar erro de Goal Id errado
      console.error('error')
    }
  }

  static validateGoalType(goalType: string | undefined) {
    const goalTypeList = [GOAL_TYPE_QUERY, GOAL_TYPE_ACHIEVE, GOAL_TYPE_PERFORM]
    if (goalType && !goalTypeList.includes(goalType)) {
      // TODO
      console.error("Error - GoalType invalido")
    }
  }


  static validateNodeIsALeaf(children: Node[]) {
    if (children.length != 0) {
      // TODO - Mostrar erro de não é folha
      console.error('error não é uma folha')
    }
  }

  static validateNodeIsNotALeaf(children: Node[]) {
    if (children.length == 0) {
      // TODO - Mostrar erro de não é folha
      console.error('error no é uma folha')
    }
  }

  static validateQueryGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = [QUERIED_PROPERTY, CONTROLS]
    const cannotContains = [ACHIEVED_CONDITION]
    this.validateProperties(_properties, requeridProperties, cannotContains)
  }

  static validateQueryGoalQueriedProperty(properties: NodeCustomProperties, variablesList: ObjectType) {
    const queriedPropertyValue = properties.QueriedProperty
    const variable = properties.Controls
    const queriedPropertyRegex = new RegExp(`^${variableIdentifierRegex}->select\\(${variableIdentifierRegex}:${variableTypeRegex} \\| ${queryGoalConditionRegex}\\)$`, 'g')

    if (queriedPropertyValue && variable) {
      if (!this.checkMatch(queriedPropertyValue, queriedPropertyRegex)) {
        // TODO - Mostrar erro queried property regex
        console.error('error')
      }

      // regex, colocar group no r, e checar se ele bate com o r depois da barra 
      const matchGroupList = new RegExp(queriedPropertyRegex).exec(queriedPropertyValue)
      if (matchGroupList) {
        // regex, colocar group no r, e checar se ele bate com o r depois da barra 
        let [_, queriedVariable, queryVariable, queryVariableInCondition] = matchGroupList
        queryVariableInCondition = queryVariableInCondition.split('.')[0]
        if (queryVariable != queryVariableInCondition) {
          // TODO - Mostrar erro variaveis com nomes diferentes
          console.error('error')
        }

        // se tem world_db ou se a variável está na lista e é do tipo sequencie
        if (queriedVariable !== 'world_db' && variablesList[queriedVariable] == undefined) {
          // TODO - Mostrar erro variável não declarada
          console.error('error Undeclared variable')
        }

        const controlsValue = properties.Controls
        if (controlsValue && getControlsVariablesList(controlsValue).length == 0) {
          // TODO - error
          console.error('error necessaria a declaração de uma variavel para receber o valor de queriedProperty')
        }

      }

    } else {
      // TODO - Error
      console.error('error')
    }
  }

  static validateAchieveGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = [ACHIEVED_CONDITION, CONTROLS, MONITORS]
    const cannotContains = [QUERIED_PROPERTY]

    this.validateProperties(_properties, requeridProperties, cannotContains)
  }

  static validateAchieveGoalAchieveCondition(properties: NodeCustomProperties, variablesList: ObjectType) {
    const achieveConditionValue = properties.AchieveCondition
    const variable = properties.Controls
    const achieveConditionRegex = new RegExp(`^${variableIdentifierRegex}->forAll\\(${variableIdentifierRegex}(?::${variableTypeRegex})? \\| ${achieveGoalConditionRegex}\\)$`, 'g')

    if (achieveConditionValue && variable) {
      // TODO - achieveCondition tem que ter 2 tipos de expressão, uma Normal ou usando forAll
      // ver com o Eric como que é uma normal
      if (!this.checkMatch(achieveConditionValue, achieveConditionRegex)) {
        // TODO - Mostrar erro queried property regex
        console.error('error 1')
      }

      // regex, colocar group no current_room, e checar se ele bate com o current_room depois da barra
      const matchGroupList = new RegExp(achieveConditionRegex).exec(achieveConditionValue)
      if (matchGroupList) {
        // regex, colocar group no current_room, e checar se ele bate com o current_room depois da barra
        let [_, iteratedVariable, iterationVariable, iterationVariableInCondition] = matchGroupList

        iterationVariableInCondition = iterationVariableInCondition.split('.')[0]
        if (iterationVariable != iterationVariableInCondition) {
          // TODO - Mostrar erro variaveis com nomes diferentes
          console.error('error 2')
        }

        // se a variável está na lista
        if (variablesList[iteratedVariable] == undefined) {
          // TODO - Mostrar erro variável não declarada
          console.error('error Undeclared variable')
        }

        // se a variável  é do tipo sequencie
        const variableType = variablesList[iteratedVariable]
        if (variableType && !isVariableTypeSequence(variableType)) {
          // TODO - Mostrar erro variável não declarada
          console.error('error Variable not type sequence')
        }

        const monitorsValue = properties.Monitors
        if (monitorsValue && !getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
          // TODO - error
          console.error('error iteratedVariable not present in Monitors property')
        }

        const controlsValue = properties.Controls
        if (controlsValue && !getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
          // TODO - error
          console.error('error iterationVariable not present in Controls')
        }
      }
    } else {
      // TODO - Error
      console.error('error')
    }
  }

  static validateTaskProperties(_properties: NodeCustomProperties) {
    // TODO - ver Propriedades Required e Cannot
    const requeridProperties: string[] = []
    const cannotContains: string[] = [QUERIED_PROPERTY, ACHIEVED_CONDITION, CREATION_CONDITION]

    this.validateProperties(_properties, requeridProperties, cannotContains)
  }

  static validateMonitorsProperty(monitorsValue: string | undefined, variablesList: ObjectType) {
    if (monitorsValue) {
      const optionalTypeRegex = `( : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))?`
      const monitorsPropertyRegex = new RegExp(`^(${variableIdentifierRegex}${optionalTypeRegex})( , (${variableIdentifierRegex}${optionalTypeRegex}))*$`, 'g')
      if (!this.checkMatch(monitorsValue, monitorsPropertyRegex)) {
        // TODO - Error de formação da variável
        console.error('Error de formação da variável, error')
        console.error(monitorsPropertyRegex)
      }


      getMonitorsVariablesList(monitorsValue).forEach(variable => {
        if (!variablesList[variable.identifier]) {
          // TODO - error
          console.error('error Variável não foi instanciada')
        }
      })
    } else {
      // TODO -  Monitors sem variaveis
      console.error('error Monitors sem variaveis')
    }
  }
  static validateControlsProperty(controlsValue: string | undefined) {
    if (controlsValue) {
      // TODO - Verificar com Eric regex do controls value, controls pode ser uma lista 
      const controlsPropertyRegex = new RegExp(`^(${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))( , (${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex})))*$`, 'g')
      if (!this.checkMatch(controlsValue, controlsPropertyRegex)) {
        // TODO - Error de formação da variável
        console.error('Error de formação da variável, error')
        console.error(controlsPropertyRegex)
      }


      getControlsVariablesList(controlsValue).forEach(variable => {
        const { identifier, type } = variable
        if (!(identifier)) {
          // TODO - Error
          console.error('error')
        }
        if (!(type)) {
          // TODO - Error
          console.error('error')
        }
      })
    } else {
      // TODO error
      console.error('error')
    }
  }
  static validateCreationConditionProperty(creationConditionValue: string | undefined) {
    if (creationConditionValue) {
      let creationConditionRegex;
      if (creationConditionValue.includes('condition')) {
        creationConditionRegex = new RegExp(`assertion condition "(\\!|not )?${variableIdentifierRegex}"`, 'g')
        if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
          // TODO - Mostrar erro queried property regex
          console.error('error')
        }
      } else if (creationConditionValue.includes('trigger')) {
        // TODO - Eric, ver regex para a lista de eventos de trigger
        creationConditionRegex = new RegExp(`assertion trigger ""`, 'g')
        if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
          // TODO - Mostrar erro queried property regex
          console.error('error')
        }
      } else {
        // TODO 
        console.error('error - creationConditionValue bad format')
      }

    }
  }
  private static checkMatch(text: string, regex: RegExp) {
    const match = text.match(new RegExp(regex))
    if (match != null && match[0] == text) {
      return true
    } else {
      return false
    }
  }

  private static validateProperties(_properties: NodeCustomProperties, requeridProperties: string[], cannotContains: string[]) {
    requeridProperties.forEach(requeridProperty => {
      if (!_properties.hasOwnProperty(requeridProperty)) {
        // TODO - Mostrar erro de Propriedade Required
        console.error('error Propriedade Required')
      }
    })

    cannotContains.forEach(cannotContainProperty => {
      if (_properties.hasOwnProperty(cannotContainProperty)) {
        // TODO - Mostrar erro de cannotContains
        console.error('error Propriedade Cannot Contais')
      }
    })
  }
}
