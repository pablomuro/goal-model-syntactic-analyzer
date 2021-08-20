"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelValidator = void 0;
const ErroLogger_1 = require("./ErroLogger");
const ModelRulesValidator_1 = require("./ModelRulesValidator");
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils/utils");
const chalk_1 = __importDefault(require("chalk"));
class ModelValidator extends ModelRulesValidator_1.ModelRulesValidator {
    constructor(tree, typesMap, tasksVarMap, hddl) {
        super(tree, typesMap, tasksVarMap, hddl);
        this.GOAL_ID = 'G';
        this.TASK_ID = 'AT';
        this.idChecker = (_ID) => {
            let count = 0;
            const ID = _ID;
            return () => {
                count++;
                return `${ID}${count}`;
            };
        };
        this.goalIdChecker = this.idChecker(this.GOAL_ID);
        this.taskIdChecker = this.idChecker(this.TASK_ID);
    }
    resetValidator() {
        this.goalIdChecker = this.idChecker(this.GOAL_ID);
        this.taskIdChecker = this.idChecker(this.TASK_ID);
        this.errorList = [];
        this.currentNodeRef.node = { ...this.tree.root };
    }
    validateModel() {
        console.log(chalk_1.default.greenBright('Validating Goal Model'));
        let visited = [];
        let current = this.tree.root;
        const context = {};
        const variablesList = {};
        let validate = (node, context, variablesList) => {
            visited.push(node.goalData?.text);
            this.manageContext(context, node);
            this.manageVariablesList(variablesList, node);
            this.validateNode(node, context, variablesList);
            node.children.forEach(_node => validate(_node, context, variablesList));
        };
        validate(current, context, variablesList);
        console.log(chalk_1.default.greenBright('Validation finished'));
        return visited;
    }
    validateNode(node, context, variablesList) {
        this.currentNodeRef.node = { ...node };
        const goalData = node.goalData;
        switch (goalData?.type) {
            case constants_1.GOAL_NODE_TYPE_GOAL:
                this.validateGoal(node, context, variablesList);
                break;
            case constants_1.GOAL_NODE_TYPE_TASK:
                this.validateTask(node, context, variablesList);
                break;
            default:
                throw new Error('Type not specified');
                break;
        }
    }
    manageVariablesList(variablesList, node) {
        const { Controls } = node.goalData.customProperties;
        if (Controls) {
            this.validateControlsProperty(Controls);
            utils_1.getControlsVariablesList(Controls).forEach(variable => {
                const { identifier, type } = variable;
                if (variablesList[identifier] !== undefined) {
                    ErroLogger_1.ErrorLogger.log(`Redeclaration of variable: ${identifier}`);
                }
                variablesList[identifier] = type;
            });
        }
    }
    manageContext(context, node) {
    }
    validateGoal(node, context, variablesList) {
        this.validateGoalTextProperty(node.goalData.text);
        this.validateId(node.goalData.text, this.goalIdChecker());
        this.validateGoalType(node.goalData.customProperties.GoalType);
        this.validateCreationConditionProperty(node.goalData.customProperties.CreationCondition);
        const validateQueryGoal = () => {
            this.validateQueryGoalProperties(node.goalData.customProperties);
            this.validateQueryGoalQueriedProperty(node.goalData.customProperties, variablesList);
            this.validateNodeIsALeaf(node.children);
        };
        const validateAchieveGoal = () => {
            this.validateAchieveGoalProperties(node.goalData.customProperties);
            this.validateMonitorsProperty(node.goalData.customProperties.Monitors, variablesList);
            this.validateAchieveGoalAchieveCondition(node.goalData.customProperties, variablesList);
            this.validateNodeIsNotALeaf(node.children);
        };
        const { GoalType } = node.goalData.customProperties;
        if (GoalType) {
            switch (GoalType) {
                case constants_1.GOAL_TYPE_QUERY:
                    validateQueryGoal();
                    break;
                case constants_1.GOAL_TYPE_ACHIEVE:
                    validateAchieveGoal();
                    break;
                case constants_1.GOAL_TYPE_PERFORM:
                    break;
            }
        }
    }
    validateTask(node, context, variablesList) {
        this.validateId(node.goalData.text, this.taskIdChecker());
        this.validateTaskTextProperty(node.goalData.text);
        this.validateTaskProperties(node.goalData.customProperties);
        this.validateTaskNameHddlMap(node.goalData.text, this.hddl);
        // TODO - ver com Eric, parameters no HDDL e sem parameters no Model, só current_room
        // typeMap -> Map(1) { 'Room' => 'room' }
        //   'AT1' => Map(1) { 'current_room' => '?rm' },
        // possível mapear "current_room: Room" para rm - room
        // mas quem mapeia "?rt - robotteam" ??
        this.validateTaskVariablesMapOnHddl(node.goalData.text, this.hddl, variablesList, this.typesMap, this.tasksVarMap);
        // TODO - Validar se parent tem Monitor
        // console.log(this.typesMap)
        // console.log(this.tasksVarMap)
    }
}
exports.ModelValidator = ModelValidator;
