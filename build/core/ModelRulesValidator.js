"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRulesValidator = void 0;
const ErroLogger_1 = require("./ErroLogger");
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils/utils");
const eventListRegex = '[a-zA-Z_0-9]*(\s*,\s*[a-zA-Z_0-9])*';
const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)';
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*';
const notRegex = '\\!?';
const queryGoalConditionOr = `${notRegex}${variableIdentifierRegex} ((=|<>) ("[a-zA-Z]+"|[0-9.]+)|(>|<)=? [0-9.]+|(in|&&|\\|\\|) ${notRegex}${variableIdentifierRegex})`;
const queryGoalConditionRegex = `(${queryGoalConditionOr}|${notRegex}${variableIdentifierRegex}|)`;
const achieveGoalConditionOr = `${notRegex}${variableIdentifierRegex} ((=|<>|(>|<)=?) ([0-9.]+)|(&&|\\|\\|) ${notRegex}${variableIdentifierRegex})`;
const achieveGoalConditionRegex = `(${achieveGoalConditionOr}|${notRegex}${variableIdentifierRegex}|)`;
class ModelRulesValidator {
    constructor(tree, typesMap, tasksVarMap, hddl) {
        this.tree = tree;
        this.tasksVarMap = tasksVarMap;
        this.typesMap = typesMap;
        this.hddl = hddl;
        this.currentNodeRef = {
            node: { ...tree.root }
        };
        ErroLogger_1.ErrorLogger.currentNodeRef = this.currentNodeRef;
    }
    validateGoalTextProperty(nodeText) {
        const goalTextPropertyRegex = /^G[0-9]+:\s*(\w*\s*(?!FALLBACK))*(([G[0-9]+(;|\#)G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g;
        if (!this.checkExactMatch(nodeText, goalTextPropertyRegex)) {
            ErroLogger_1.ErrorLogger.log('Bad Goal Name Construction');
            // TODO - Erros via match vão ter q ser feitos novos regex
            // caso necessário refinamento do erro
        }
    }
    validateTaskTextProperty(taskText) {
        const taskTextPropertyRegex = /^AT[0-9]+: (\w+\s*)+$/g;
        if (!this.checkExactMatch(taskText, taskTextPropertyRegex)) {
            ErroLogger_1.ErrorLogger.log('Bad Task Name Construction');
        }
    }
    validateId(nodeText, validId) {
        if (!nodeText.includes(`${validId}:`)) {
            ErroLogger_1.ErrorLogger.log(`Bad ID sequence\nID should be: ${validId}`);
        }
    }
    validateGoalType(goalType) {
        const goalTypeList = [constants_1.GOAL_TYPE_QUERY, constants_1.GOAL_TYPE_ACHIEVE, constants_1.GOAL_TYPE_PERFORM];
        if (goalType && !goalTypeList.includes(goalType)) {
            ErroLogger_1.ErrorLogger.log("Invalid GoalType");
        }
    }
    validateNodeIsALeaf(children) {
        if (children.length != 0) {
            ErroLogger_1.ErrorLogger.log('Node must be a leaf, but node has children');
        }
    }
    validateNodeIsNotALeaf(children) {
        if (children.length == 0) {
            ErroLogger_1.ErrorLogger.log('Node cannot be a leaf, but node has no children');
        }
    }
    validateQueryGoalProperties(_properties) {
        const requeridProperties = [constants_1.QUERIED_PROPERTY, constants_1.CONTROLS];
        const cannotContains = [constants_1.ACHIEVED_CONDITION];
        this.validateProperties(_properties, constants_1.GOAL_TYPE_QUERY, requeridProperties, cannotContains);
    }
    validateQueryGoalQueriedProperty(properties, variablesList) {
        const queriedPropertyValue = properties.QueriedProperty;
        const queriedPropertyRegex = new RegExp(`^${variableIdentifierRegex}->select\\(\\s*${variableIdentifierRegex}\\s*:\\s*${variableTypeRegex} \\|\\s*${queryGoalConditionRegex}\\)$`, 'g');
        if (queriedPropertyValue) {
            if (!this.checkExactMatch(queriedPropertyValue, queriedPropertyRegex)) {
                let errorMsg = `Bad QueriedProperty Construction:\n`;
                // TODO - console.log(queriedPropertyValue.match(new RegExp(`^${variableIdentifierRegex}(?=->)`)))
                if (!this.checkLoseMatch(queriedPropertyValue, `^${variableIdentifierRegex}(?=->)`, 'g')) {
                    errorMsg += ` Queried variable has a invalid identifier\n`;
                }
                if (!this.checkLoseMatch(queriedPropertyValue, `->select`)) {
                    errorMsg += ` QueriedProperty value is missing the "->select" OCL statement\n`;
                }
                if (!this.checkLoseMatch(queriedPropertyValue, `\\(\\s*${variableIdentifierRegex}\\s*:\\s*${variableTypeRegex}`)) {
                    errorMsg += ` Query variable: Identifier or Type error\n`;
                }
                if (!this.checkLoseMatch(queriedPropertyValue, `\\|\\s*${queryGoalConditionRegex}\\)$`)) {
                    errorMsg += ` Error on condition construction\n`;
                }
                ErroLogger_1.ErrorLogger.log(errorMsg);
            }
            const matchGroupList = new RegExp(queriedPropertyRegex).exec(queriedPropertyValue);
            if (matchGroupList) {
                let [_, queriedVariable, queryVariable, variablesInConditionString] = matchGroupList;
                variablesInConditionString = variablesInConditionString.replace(/"[a-zA-Z]+"/, ' ');
                const variablesInCondition = variablesInConditionString.match(new RegExp(`${variableIdentifierRegex}`, 'g'));
                if (variablesInCondition) {
                    variablesInCondition.forEach(variable => {
                        if (!variable?.includes(queryVariable)) {
                            ErroLogger_1.ErrorLogger.log(`Query variable: "${queryVariable}" not equal to the variable: "${variable.split('.')[0]}" in the condition`);
                        }
                    });
                }
                if (queriedVariable !== constants_1.WORLD_DB) {
                    const variableType = variablesList[queriedVariable];
                    if (variableType == undefined) {
                        ErroLogger_1.ErrorLogger.log(`Undeclared variable: ${queriedVariable} used in QueriedProperty`);
                    }
                    else {
                        if (!queriedVariable.includes('.') && !utils_1.isVariableTypeSequence(variableType)) {
                            ErroLogger_1.ErrorLogger.log('Query variable type is not a Sequence');
                        }
                    }
                }
                const controlsValue = properties.Controls;
                if (controlsValue && utils_1.getControlsVariablesList(controlsValue).length == 0) {
                    ErroLogger_1.ErrorLogger.log('Must be a variable in Controls to receive a QueriedProperty value');
                }
            }
        }
        else {
            ErroLogger_1.ErrorLogger.log('No QueriedProperty value defined');
        }
    }
    validateAchieveGoalProperties(_properties) {
        const requeridProperties = [constants_1.ACHIEVED_CONDITION, constants_1.CONTROLS, constants_1.MONITORS];
        const cannotContains = [constants_1.QUERIED_PROPERTY];
        this.validateProperties(_properties, constants_1.GOAL_TYPE_ACHIEVE, requeridProperties, cannotContains);
    }
    validateAchieveGoalAchieveCondition(properties, variablesList) {
        const achieveConditionValue = properties.AchieveCondition;
        const achieveConditionUniversalRegex = new RegExp(`^${variableIdentifierRegex}->forAll\\(\\s*${variableIdentifierRegex}\\s*(?::${variableTypeRegex})? \\| ${achieveGoalConditionRegex}\\)$`, 'g');
        const achieveConditionRegex = new RegExp(`${achieveGoalConditionRegex}`);
        if (achieveConditionValue) {
            const testAchieveConditionRegex = (achieveConditionValue.includes('->forAll') ? achieveConditionUniversalRegex : achieveConditionRegex);
            if (!this.checkExactMatch(achieveConditionValue, testAchieveConditionRegex)) {
                let errorMsg = `Bad AchieveCondition Construction:\n`;
                if (achieveConditionValue.includes('->forAll')) {
                    if (!this.checkLoseMatch(achieveConditionValue, `^${variableIdentifierRegex}(?=->)`, 'g')) {
                        errorMsg += ` Iterated variable has a invalid identifier\n`;
                    }
                    if (!this.checkLoseMatch(achieveConditionValue, `->forAll`)) {
                        errorMsg += ` AchieveCondition value is missing the "->forAll" OCL statement\n`;
                    }
                    if (!this.checkLoseMatch(achieveConditionValue, `\\(\\s*${variableIdentifierRegex}\\s*(?::${variableTypeRegex})?`)) {
                        errorMsg += ` Iteration variable: Identifier or Type error\n`;
                    }
                    if (!this.checkLoseMatch(achieveConditionValue, `\\|\\s*${queryGoalConditionRegex}\\)$`)) {
                        errorMsg += ` Error on condition construction\n`;
                    }
                }
                else {
                    if (!this.checkLoseMatch(achieveConditionValue, `${achieveGoalConditionRegex}`)) {
                        errorMsg += ` Error on condition construction\n`;
                    }
                }
                console.log(achieveConditionValue.match(new RegExp(`${achieveGoalConditionRegex}`)));
                ErroLogger_1.ErrorLogger.log(errorMsg);
            }
            if (!achieveConditionValue.includes('->forAll'))
                return;
            const matchGroupList = new RegExp(testAchieveConditionRegex).exec(achieveConditionValue);
            if (matchGroupList) {
                let [_, iteratedVariable, iterationVariable, variablesInConditionString] = matchGroupList;
                const variablesInCondition = variablesInConditionString.match(new RegExp(`${variableIdentifierRegex}`, 'g'));
                if (variablesInCondition) {
                    variablesInCondition.forEach(variable => {
                        if (!variable?.includes(iterationVariable)) {
                            ErroLogger_1.ErrorLogger.log(`Iteration variable: "${iterationVariable}" not equal to the variable: "${variable.split('.')[0]}" in the condition`);
                        }
                    });
                }
                if (variablesList[iteratedVariable] == undefined) {
                    ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} is not instantiated`);
                }
                const variableType = variablesList[iteratedVariable];
                if (!iteratedVariable.includes('.') && variableType && !utils_1.isVariableTypeSequence(variableType)) {
                    ErroLogger_1.ErrorLogger.log('Iterated variable type is not a Sequence');
                }
                const monitorsValue = properties.Monitors;
                if (monitorsValue && !utils_1.getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
                    ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} not present in monitored variables list`);
                }
                const controlsValue = properties.Controls;
                if (controlsValue && !utils_1.getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
                    ErroLogger_1.ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in control variables list`);
                }
            }
        }
        else {
            // TODO - Essa condição ainda será validada, atualmente pode ser em Branco
            ErroLogger_1.ErrorLogger.log('No AchieveCondition value defined');
        }
    }
    validateTaskProperties(_properties) {
        const requeridProperties = [];
        const cannotContains = [constants_1.QUERIED_PROPERTY, constants_1.ACHIEVED_CONDITION, constants_1.CREATION_CONDITION];
        this.validateProperties(_properties, constants_1.TASK_TYPE, requeridProperties, cannotContains);
    }
    validateTaskNameHddlMap(taskText, hddl) {
        const taskName = utils_1.getTaskName(taskText);
        if (taskName) {
            const taskHddlDefinition = `(:task ${taskName}`;
            if (!hddl.includes(taskHddlDefinition)) {
                ErroLogger_1.ErrorLogger.log(`Task: ${taskName} not mapped on .hddl file`);
            }
        }
    }
    validateTaskVariablesMapOnHddl(taskText, hddl, variablesList, typesMap, tasksVarMap) {
        // TODO - ver 
        const _type = variablesList['current_room'];
        const taskId = utils_1.getTaskId(taskText);
        if (_type && taskId) {
            const hddlVariableIdentifier = tasksVarMap.get(taskId)?.get('current_room');
            const hddlType = typesMap.get(_type);
            const hddlVariable = `${hddlVariableIdentifier} - ${hddlType}`;
            // console.log(hddlVariable)
            // ErrorLogger.log('Types diferentes no HDDL')
        }
    }
    validateMonitorsProperty(monitorsValue, variablesList) {
        if (monitorsValue) {
            const optionalTypeRegex = `( : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))?`;
            const monitorsPropertyRegex = new RegExp(`^(${variableIdentifierRegex}${optionalTypeRegex})( , (${variableIdentifierRegex}${optionalTypeRegex}))*$`, 'g');
            const monitorsVariablesList = utils_1.getMonitorsVariablesList(monitorsValue);
            if (!this.checkExactMatch(monitorsValue, monitorsPropertyRegex)) {
                let errorMsg = `Bad Monitors Property Construction:\n`;
                errorMsg += ` Variable(s) identifier or type, bad format\n`;
                const monitorVariablesMatch = monitorsValue.match(new RegExp(`${variableIdentifierRegex}${optionalTypeRegex}`, 'g'));
                if (monitorVariablesMatch) {
                    monitorsVariablesList.forEach(variable => {
                        let badFormat = true;
                        monitorVariablesMatch.forEach(matchVariable => {
                            if (matchVariable.includes(variable.identifier)) {
                                badFormat = false;
                                return;
                            }
                        });
                        if (badFormat) {
                            errorMsg += ` Variable: ${variable.identifier} is bad formatted`;
                        }
                    });
                }
                ErroLogger_1.ErrorLogger.log(errorMsg);
            }
            monitorsVariablesList.forEach(variable => {
                if (!variablesList[variable.identifier]) {
                    ErroLogger_1.ErrorLogger.log(`Variable: ${variable.identifier} used on Monitors has not instantiated`);
                }
            });
        }
        else {
            ErroLogger_1.ErrorLogger.log('No Monitors value defined');
        }
    }
    validateControlsProperty(controlsValue) {
        if (controlsValue) {
            // TODO - Questão de Sequence, validar futuramente
            const controlsPropertyRegex = new RegExp(`^(${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))( , (${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex})))*$`, 'g');
            if (!this.checkExactMatch(controlsValue, controlsPropertyRegex)) {
                ErroLogger_1.ErrorLogger.log('Bad Controls Construction');
                // TODO - se erro, falar qual erro, ver groups e oq ta faltando
            }
            utils_1.getControlsVariablesList(controlsValue).forEach(variable => {
                const { identifier, type } = variable;
                if (!(identifier)) {
                    ErroLogger_1.ErrorLogger.log('Variable identifier in Controls property has an error');
                }
                if (!(type)) {
                    ErroLogger_1.ErrorLogger.log('Variable type in Controls property is required');
                }
            });
        }
        else {
            ErroLogger_1.ErrorLogger.log('No Controls value defined');
        }
    }
    validateCreationConditionProperty(creationConditionValue) {
        if (creationConditionValue) {
            let creationConditionRegex;
            if (creationConditionValue.includes('condition')) {
                creationConditionRegex = new RegExp(`assertion condition "(\\!|not )?${variableIdentifierRegex}"`, 'g');
                if (!this.checkExactMatch(creationConditionValue, creationConditionRegex)) {
                    ErroLogger_1.ErrorLogger.log('Bad CreationCondition Construction');
                    // TODO - se erro, falar qual erro, ver groups e oq ta faltando
                }
            }
            else if (creationConditionValue.includes('trigger')) {
                creationConditionRegex = new RegExp(`assertion trigger "${eventListRegex}"`, 'g');
                if (!this.checkExactMatch(creationConditionValue, creationConditionRegex)) {
                    ErroLogger_1.ErrorLogger.log('Bad CreationCondition Construction');
                    // TODO - se erro, falar qual erro, ver groups e oq ta faltando
                }
            }
            else {
                ErroLogger_1.ErrorLogger.log(`Bad CreationCondition Construction, must includes 'assertion condition' or 'assertion trigger'`);
            }
        }
    }
    checkExactMatch(text, regex, flag = undefined) {
        const newRegex = (flag) ? new RegExp(regex, flag) : new RegExp(regex);
        const match = text.match(newRegex);
        if (match != null && match[0] == text) {
            return true;
        }
        else {
            return false;
        }
    }
    checkLoseMatch(text, regex, flag = undefined) {
        const newRegex = (flag) ? new RegExp(regex, flag) : new RegExp(regex);
        const match = text.match(newRegex);
        if (match != null) {
            return true;
        }
        else {
            return false;
        }
    }
    validateProperties(_properties, nodeType, requeridProperties, cannotContains) {
        requeridProperties.forEach(requeridProperty => {
            if (!_properties.hasOwnProperty(requeridProperty)) {
                ErroLogger_1.ErrorLogger.log(`Property: ${requeridProperty} is required on type: ${nodeType}`);
            }
        });
        cannotContains.forEach(cannotContainProperty => {
            if (_properties.hasOwnProperty(cannotContainProperty)) {
                ErroLogger_1.ErrorLogger.log(`Node type: ${nodeType} cannot contain the property: ${cannotContainProperty}`);
            }
        });
    }
}
exports.ModelRulesValidator = ModelRulesValidator;
