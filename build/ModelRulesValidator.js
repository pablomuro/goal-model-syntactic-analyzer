"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRulesValidator = void 0;
const ErroLogger_1 = require("./ErroLogger");
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils/utils");
const variableIdentifierRegex = '([a-zA-Z][a-zA-Z_.0-9]*)';
const variableTypeRegex = '[A-Z][a-zA-Z_0-9]*';
const queryGoalConditionOr = `( (=|<>) ("[a-zA-Z]+"|[0-9.]+)| (>|<)=? [0-9.]+| ${variableIdentifierRegex} in ${variableIdentifierRegex}|)`;
const queryGoalConditionRegex = `\\!?${variableIdentifierRegex}${queryGoalConditionOr}`;
const achieveGoalConditionOr = `( (=|<>|(>|<)=?) ([0-9.]+)|)`;
const achieveGoalConditionRegex = `\\!?${variableIdentifierRegex}${achieveGoalConditionOr}`;
class ModelRulesValidator {
    constructor(tree, typesMap, tasksVarMap, hddl) {
        this.errorList = [];
        this.tree = tree;
        this.tasksVarMap = tasksVarMap;
        this.typesMap = typesMap;
        this.hddl = hddl;
        this.errorList = [];
        this.currentNodeRef = {
            node: { ...tree.root }
        };
        ErroLogger_1.ErrorLogger.currentNodeRef = this.currentNodeRef;
    }
    validateGoalTextProperty(nodeText) {
        const goalTextPropertyRegex = /^G[0-9]+: (\w*\s*)*(([G[0-9]+;G[0-9]+])|([G[0-9]+\#G[0-9]+])|(\[FALLBACK\((G[0-9](,G[0-9])*)\)\])*$)/g;
        if (!this.checkMatch(nodeText, goalTextPropertyRegex)) {
            ErroLogger_1.ErrorLogger.log('Bad Goal Name Construction');
            // TODO - se erro, falar qual erro, ver groups e oq ta faltando
        }
    }
    validateTaskTextProperty(taskText) {
        const taskTextPropertyRegex = /^AT[0-9]+: (\w+\s*)+$/g;
        if (!this.checkMatch(taskText, taskTextPropertyRegex)) {
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
        const queriedPropertyRegex = new RegExp(`^${variableIdentifierRegex}->select\\(${variableIdentifierRegex}:${variableTypeRegex} \\| ${queryGoalConditionRegex}\\)$`, 'g');
        if (queriedPropertyValue) {
            if (!this.checkMatch(queriedPropertyValue, queriedPropertyRegex)) {
                ErroLogger_1.ErrorLogger.log('Bad QueriedProperty Construction');
                // TODO - se erro, falar qual erro, ver groups e oq ta faltando
            }
            const matchGroupList = new RegExp(queriedPropertyRegex).exec(queriedPropertyValue);
            if (matchGroupList) {
                let [_, queriedVariable, queryVariable, queryVariableInCondition] = matchGroupList;
                queryVariableInCondition = queryVariableInCondition.split('.')[0];
                if (queryVariable != queryVariableInCondition) {
                    ErroLogger_1.ErrorLogger.log(`Query variable: ${queryVariable} not equal to the variable:${queryVariableInCondition} in the condition`);
                }
                // TODO - ver se variavel tem q ser uma Sequencie
                if (queriedVariable !== constants_1.WORLD_DB && variablesList[queriedVariable] == undefined) {
                    ErroLogger_1.ErrorLogger.log(`Undeclared variable: ${queriedVariable} used in QueriedProperty`);
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
        const achieveConditionRegex = new RegExp(`^${variableIdentifierRegex}->forAll\\(${variableIdentifierRegex}(?::${variableTypeRegex})? \\| ${achieveGoalConditionRegex}\\)$`, 'g');
        if (achieveConditionValue) {
            // TODO - achieveCondition tem que ter 2 tipos de expressão, uma Normal ou usando forAll
            // ver com o Eric como que é uma normal
            if (!this.checkMatch(achieveConditionValue, achieveConditionRegex)) {
                ErroLogger_1.ErrorLogger.log('Bad AchieveCondition Construction');
                // TODO - se erro, falar qual erro, ver groups e oq ta faltando
            }
            const matchGroupList = new RegExp(achieveConditionRegex).exec(achieveConditionValue);
            if (matchGroupList) {
                let [_, iteratedVariable, iterationVariable, iterationVariableInCondition] = matchGroupList;
                iterationVariableInCondition = iterationVariableInCondition.split('.')[0];
                if (iterationVariable != iterationVariableInCondition) {
                    ErroLogger_1.ErrorLogger.log(`Iteration variable: ${iterationVariable} not equal to the variable:${iterationVariableInCondition} in the condition`);
                }
                if (variablesList[iteratedVariable] == undefined) {
                    ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} is not instantiated`);
                }
                const variableType = variablesList[iteratedVariable];
                if (variableType && !utils_1.isVariableTypeSequence(variableType)) {
                    ErroLogger_1.ErrorLogger.log('Iterated variable type is not a Sequence');
                }
                const monitorsValue = properties.Monitors;
                if (monitorsValue && !utils_1.getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
                    ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} not present in monitored variables list`);
                }
                const controlsValue = properties.Controls;
                if (controlsValue && !utils_1.getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
                    ErroLogger_1.ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in monitored variables list`);
                }
            }
        }
        else {
            ErroLogger_1.ErrorLogger.log('No AchieveCondition value defined');
        }
    }
    validateTaskProperties(_properties) {
        // TODO - ver Propriedades Required e Cannot
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
            if (!this.checkMatch(monitorsValue, monitorsPropertyRegex)) {
                ErroLogger_1.ErrorLogger.log('Bad Monitors Construction');
                // TODO - se erro, falar qual erro, ver groups e oq ta faltando
            }
            utils_1.getMonitorsVariablesList(monitorsValue).forEach(variable => {
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
            // TODO - Verificar com Eric regex do controls value, controls pode ser uma lista 
            const controlsPropertyRegex = new RegExp(`^(${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex}))( , (${variableIdentifierRegex} : (Sequence\\(${variableTypeRegex}\\)|${variableTypeRegex})))*$`, 'g');
            if (!this.checkMatch(controlsValue, controlsPropertyRegex)) {
                ErroLogger_1.ErrorLogger.log('Bad Controls Construction');
                // TODO - se erro, falar qual erro, ver groups e oq ta faltando
            }
            utils_1.getControlsVariablesList(controlsValue).forEach(variable => {
                const { identifier, type } = variable;
                if (!(identifier)) {
                    ErroLogger_1.ErrorLogger.log('Variable in Controls property error');
                }
                if (!(type)) {
                    ErroLogger_1.ErrorLogger.log('Variable Type in Controls property is required');
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
                if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
                    ErroLogger_1.ErrorLogger.log('Bad CreationCondition Construction');
                    // TODO - se erro, falar qual erro, ver groups e oq ta faltando
                }
            }
            else if (creationConditionValue.includes('trigger')) {
                // TODO - Eric, ver regex para a lista de eventos de trigger
                creationConditionRegex = new RegExp(`assertion trigger ""`, 'g');
                if (!this.checkMatch(creationConditionValue, creationConditionRegex)) {
                    ErroLogger_1.ErrorLogger.log('Bad CreationCondition Construction');
                    // TODO - se erro, falar qual erro, ver groups e oq ta faltando
                }
            }
            else {
                ErroLogger_1.ErrorLogger.log(`Bad CreationCondition Construction, must includes 'assertion condition' or 'assertion trigger'`);
            }
        }
    }
    checkMatch(text, regex) {
        const match = text.match(new RegExp(regex));
        if (match != null && match[0] == text) {
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
