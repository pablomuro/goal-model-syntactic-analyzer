export interface ObjectType {
  [key: string]: string | undefined
}

export interface VariablesType {
  identifier: string;
  type: string;
}

export const getTaskId = (taskText: string) => taskText.split(':')?.shift()?.trim()

export const getTaskName = (taskText: string) => taskText.split(':')?.pop()?.trim()

export const getControlsVariablesList = (variableText: string): VariablesType[] => {
  const variablesList = variableText.split(',')

  return variablesList.map(variable => {
    const [variableIdentifier, variableType] = variable.trim().split(':')
    return {
      identifier: variableIdentifier.trim(),
      type: variableType?.trim()
    }
  })
}

export const getMonitorsVariablesList = (variableText: string): VariablesType[] => {
  return getControlsVariablesList(variableText)
}

export const isVariableTypeSequence = (variableType: string) => variableType.includes('Sequence')