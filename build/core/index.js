"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("./../test");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const GoalTree_1 = require("./GoalTree");
const ModelValidator_1 = require("./ModelValidator");
// TODO - Remover path na mão
let hddlPath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'hddl', 'Room Cleaning.hddl');
let goalModelPath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'gm', 'Room Cleaning.txt');
let configFilePath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'configs', 'Room Cleaning Config.json');
main();
async function main() {
    try {
        const [_hddlPath, _goalModelPath, _configFilePath] = process.argv.slice(2);
        if (_hddlPath && _goalModelPath && _configFilePath) {
            hddlPath = _hddlPath;
            goalModelPath = _goalModelPath;
            configFilePath = _configFilePath;
        }
        const configFile = JSON.parse(await (await promises_1.readFile(configFilePath)).toString());
        const goalModel = JSON.parse(await (await promises_1.readFile(goalModelPath)).toString());
        const hddl = await (await promises_1.readFile(hddlPath)).toString();
        checkConfigFile(configFile);
        const typesMap = extractOclToHddlTypesMap(configFile);
        const tasksVarMap = extractTasksVarMap(configFile);
        const tree = goalTreeBuild(goalModel);
        if (tree) {
            const modelValidator = new ModelValidator_1.ModelValidator(tree, typesMap, tasksVarMap, hddl);
            modelValidator.resetValidator();
            // modelValidator.validateModel()
            new test_1.ModelRulesValidatorTest(modelValidator).test();
        }
    }
    catch (error) {
        console.error(error);
    }
}
function checkConfigFile(configFile) {
    if (!configFile.type_mapping || !configFile.var_mapping) {
        throw Error('Error: type_mapping or var_mapping missing in the config file');
    }
    ;
}
function extractOclToHddlTypesMap(configFile) {
    const typesMap = new Map();
    configFile.type_mapping.forEach(mapping => {
        typesMap.set(mapping.ocl_type, mapping.hddl_type);
    });
    return typesMap;
}
function extractTasksVarMap(configFile) {
    const tasksVarMap = new Map();
    configFile.var_mapping.forEach(taskElement => {
        tasksVarMap.set(taskElement.task_id, new Map());
        const taskIdVarMap = tasksVarMap.get(taskElement.task_id);
        taskElement.map.forEach(variables => taskIdVarMap?.set(variables.gm_var, variables.hddl_var));
    });
    return tasksVarMap;
}
const goalTreeBuild = function (goalModel) {
    if (!goalModel)
        return;
    const tree = new GoalTree_1.GoalTree();
    if (goalModel.actors) {
        const actor = goalModel.actors.pop();
        const nodes = actor?.nodes;
        const links = goalModel.links;
        if (nodes && links) {
            tree.buildTree(nodes, links);
        }
        return tree;
    }
};
