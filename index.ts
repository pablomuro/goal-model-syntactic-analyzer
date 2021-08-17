import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path'


const configFilePath = path.join('./goal-model-examples', 'Room Cleaning Example', 'configs', 'Room Cleaning Config.json')
const goalModelPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'gm', 'Room Cleaning.txt')
const hddlPath = path.join('./goal-model-examples', 'Room Cleaning Example', 'hddl', 'Room Cleaning.hddl')


main()
async function main() {
  const configFile = JSON.parse(await (await readFile(configFilePath)).toString())
  const goalModel = JSON.parse(await (await readFile(goalModelPath)).toString())
  const hddl = await (await readFile(hddlPath)).toString()

  console.log(hddl)
}
