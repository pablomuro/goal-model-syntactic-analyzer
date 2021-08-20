import { getControlsVariable } from './utils';
import { NodeCustomProperties } from './definitions/goal-model.types';
import { GoalTree, Node } from './GoalTree';

const variableIdentifier = '([a-zA-Z][a-zA-Z_.0-9]*)'
const variableType = '[A-Z][a-zA-Z_0-9]*'
const conditionOr = `( (=|<>) ("[a-zA-Z]+"|[0-9.]+)| (>|<)=? [0-9.]+| ${variableIdentifier} in ${variableIdentifier}|)`
const conditionRegex =
  `\\!?${variableIdentifier}${conditionOr}`


export class ModelRulesValidator {



  static validateGoalTextProperty(nodeText: string) {
    const goalTextPropertyRegex = /^G[0-9]+:(\w*\s*)*(([G[0-9]+;G[0-9]+])|([G[0-9]+\#G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g

    if (!this.checkMatch(nodeText, goalTextPropertyRegex)) {
      // TODO - Mostrar erro no nome
      console.log('error')
    }
  }

  static validateId(nodeText: string, validId: string) {
    if (!nodeText.includes(validId)) {
      // TODO - Mostrar erro de Goal Id errado
      console.log('error')
    }
  }

  static validateQueryGoalProperties(_properties: NodeCustomProperties) {
    const requeridProperties = ['QueriedProperty', 'Controls']

    requeridProperties.forEach(requeridProperty => {
      if (!_properties.hasOwnProperty(requeridProperty)) {
        // TODO - Mostrar erro de Propriedade Required
        console.log('error')
      }
    })
  }

  static validateQueryGoalQueriedProperty(properties: NodeCustomProperties) {
    const queriedPropertyValue = properties.QueriedProperty
    const variable = properties.Controls
    const queriedPropertyRegex = new RegExp(`^${variableIdentifier}->select\\(${variableIdentifier}:${variableType} \\| ${conditionRegex}\\)$`, 'g')

    // TODO - Verificações
    // world_db->select(r:Room | !r.is_clean)
    // fazer regex
    // regex, colocar group no r, e checar se ele bate com o r depois da barra 
    // se tem world_db ou se a variável está na lista e é do tipo sequencie

    if (queriedPropertyValue && variable) {
      if (!this.checkMatch(queriedPropertyValue, queriedPropertyRegex)) {
        // TODO - Mostrar erro queried property regex
        console.log('error')
      }

    } else {
      // TODO - Error
      console.log('error')
    }
  }

  static validateControlsProperty(controlsValue: string | undefined) {
    if (controlsValue) {
      // TODO - Verificar com Eric regex do controls value, controls pode ser uma lista 
      // const controlsPropertyRegex = /^(([a-zA-Z_][a-zA-Z_0-9]*) : (Sequence\(${this.type}\)|[A-Z][a-zA-Z_$0-9]*))( , (([a-zA-Z_$][a-zA-Z_$0-9]*) : (Sequence\([A-Z][a-zA-Z_$0-9]*\)|[A-Z][a-zA-Z_$0-9]*)))*$/g
      const controlsPropertyRegex = new RegExp(`^(${variableIdentifier} : (Sequence\\(${variableType}\\)|${variableType}))( , (${variableIdentifier} : (Sequence\(${variableType}\)|${variableType})))*$`, 'g')
      if (!this.checkMatch(controlsValue, controlsPropertyRegex)) {
        // TODO - Error de formação da variável
        console.log('Error de formação da variável, error')
        console.log(controlsPropertyRegex)
      }

      const { identifier, type } = getControlsVariable(controlsValue)
      if (!(identifier)) {
        // TODO - Error
        console.log('error')
      }
      if (!(type)) {
        // TODO - Error
        console.log('error')
      }
    } else {
      // TODO error
      console.log('error')
    }
  }
  private static checkMatch(text: string, regex: RegExp) {
    const match = text.match(new RegExp(regex))
    console.log(match)
    if (match != null && match[0] == text) {
      return true
    } else {
      return false
    }
  }
}
