export interface ObjectType {
  [key: string]: string | undefined
}


export const getControlsVariable = (variableText: string) => {
  const [variableIdentifier, variableType] = variableText.split(':')
  return {
    identifier: variableIdentifier.trim(),
    type: variableType.trim()
  }
}

export const isVariableTypeSequence = (variableType: string) => variableType.includes('Sequence')