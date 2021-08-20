import { ModelRulesValidator } from './ModelRulesValidator';
import { ModelValidator } from './ModelValidator';

import { GoalNode, GoalModel } from './definitions/goal-model.types';
import { Config } from './definitions/config.types';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path'
import { GoalTree, Node } from './GoalTree';

const configFilePath = path.join('./goal-model-examples', 'Room Cleaning Example', 'configs', 'Room Cleaning Config.json')
const goalModelPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'gm', 'Room Cleaning.txt')
const hddlPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'hddl', 'Room Cleaning.hddl')


const errorList = []

main()
async function main() {
  const configFile: Config = JSON.parse(await (await readFile(configFilePath)).toString())
  const goalModel = JSON.parse(await (await readFile(goalModelPath)).toString())
  const hddl = await (await readFile(hddlPath)).toString()

  const typesMap: Map<string, string> = extractOclToHddlTypesMap(configFile)
  const tasksVarMap: Map<string, Map<string, string>> = extractTasksVarMap(configFile)

  const tree = goalTreeBuild(goalModel)
  if (tree) {
    const modelValidator = new ModelValidator(tree, typesMap, tasksVarMap, hddl)
    modelValidator.resetValidator()
    modelValidator.validateModel()
  }

}

function parseConfigFile(configFile: any) {
  // TODO - vou ter q validar o json de configuração???
  if (!configFile.type_mapping) return;
  console.log(configFile.var_mapping)
  console.log(configFile.type_mapping)
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