"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVariableTypeSequence = exports.getMonitorsVariablesList = exports.getControlsVariablesList = exports.getTaskName = exports.getTaskId = void 0;
const getTaskId = (taskText) => taskText.split(':')?.shift()?.trim();
exports.getTaskId = getTaskId;
const getTaskName = (taskText) => taskText.split(':')?.pop()?.trim();
exports.getTaskName = getTaskName;
const getControlsVariablesList = (variableText) => {
    const variablesList = variableText.split(',');
    return variablesList.map(variable => {
        const [variableIdentifier, variableType] = variable.trim().split(':');
        return {
            identifier: variableIdentifier.trim(),
            type: variableType?.trim()
        };
    });
};
exports.getControlsVariablesList = getControlsVariablesList;
const getMonitorsVariablesList = (variableText) => {
    return exports.getControlsVariablesList(variableText);
};
exports.getMonitorsVariablesList = getMonitorsVariablesList;
const isVariableTypeSequence = (variableType) => variableType.includes('Sequence');
exports.isVariableTypeSequence = isVariableTypeSequence;
