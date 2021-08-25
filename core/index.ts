import { ModelRulesValidatorTest } from './../test';
import { readFile } from 'fs/promises';
import path from 'path';
import { Config } from './definitions/config.types';
import { GoalModel } from './definitions/goal-model.types';
import { GoalTree } from './GoalTree';
import { ModelValidator } from './ModelValidator';


// TODO - Remover path na mão
let hddlPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'hddl', 'Room Cleaning.hddl')
let goalModelPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'gm', 'Room Cleaning.txt')
let configFilePath = path.join('./goal-model-examples', 'Room Cleaning Example', 'configs', 'Room Cleaning Config.json')

main()
async function main() {

  try {
    const [_hddlPath, _goalModelPath, _configFilePath] = process.argv.slice(2)

    if (_hddlPath && _goalModelPath && _configFilePath) {
      hddlPath = _hddlPath
      goalModelPath = _goalModelPath
      configFilePath = _configFilePath
    }

    const configFile: Config = JSON.parse(await (await readFile(configFilePath)).toString())
    const goalModel = JSON.parse(await (await readFile(goalModelPath)).toString())
    const hddl = await (await readFile(hddlPath)).toString()

    checkConfigFile(configFile)

    const typesMap: Map<string, string> = extractOclToHddlTypesMap(configFile)
    const tasksVarMap: Map<string, Map<string, string>> = extractTasksVarMap(configFile)

    const tree = goalTreeBuild(goalModel)
    if (tree) {
      const modelValidator = new ModelValidator(tree, typesMap, tasksVarMap, hddl)
      modelValidator.resetValidator()
      // modelValidator.validateModel()
      new ModelRulesValidatorTest(modelValidator).test()
    }
  } catch (error) {
    console.error(error)
  }
}

function checkConfigFile(configFile: Config) {
  if (!configFile.type_mapping || !configFile.var_mapping) {
    throw Error('Error: type_mapping or var_mapping missing in the config file')
  };
}

function extractOclToHddlTypesMap(configFile: Config): Map<string, string> {
  const typesMap: Map<string, string> = new Map()
  configFile.type_mapping.forEach(mapping => {
    typesMap.set(mapping.ocl_type, mapping.hddl_type)
  });

  return typesMap;
}

function extractTasksVarMap(configFile: Config): Map<string, Map<string, string>> {
  const tasksVarMap: Map<string, Map<string, string>> = new Map()

  configFile.var_mapping.forEach(taskElement => {
    tasksVarMap.set(taskElement.task_id, new Map())
    const taskIdVarMap = tasksVarMap.get(taskElement.task_id)
    taskElement.map.forEach(variables => taskIdVarMap?.set(variables.gm_var, variables.hddl_var))
  });

  return tasksVarMap;
}

const goalTreeBuild = function (goalModel: GoalModel): GoalTree | undefined {
  if (!goalModel) return

  const tree = new GoalTree()
  if (goalModel.actors) {
    const actor = goalModel.actors.pop()
    const nodes = actor?.nodes
    const links = goalModel.links

    if (nodes && links) {
      tree.buildTree(nodes, links)
    }

    return tree;
  }
}