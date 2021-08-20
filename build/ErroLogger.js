"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ErrorLogger {
    static log(erroMessage) {
        const styledErrorMessage = chalk_1.default.bold.red(erroMessage);
        const nodeName = this.currentNodeRef.node.goalData.text;
        console.error(chalk_1.default.bold.red(`Error on Node: ${nodeName}`));
        console.error(styledErrorMessage);
    }
}
exports.ErrorLogger = ErrorLogger;
ErrorLogger.currentNodeRef = {};
