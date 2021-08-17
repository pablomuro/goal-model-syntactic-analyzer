"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const configFilePath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'configs', 'Room Cleaning Config.json');
const goalModelPath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'gm', 'Room Cleaning.txt');
const hddlPath = path_1.default.join('./goal-model-examples', 'Room Cleaning Example', 'hddl', 'Room Cleaning.hddl');
main();
async function main() {
    const configFile = JSON.parse(await (await promises_1.readFile(configFilePath)).toString());
    const goalModel = JSON.parse(await (await promises_1.readFile(goalModelPath)).toString());
    const hddl = await (await promises_1.readFile(hddlPath)).toString();
    console.log(configFile);
}
