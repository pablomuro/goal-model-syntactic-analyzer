"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ErrorLogger {
    static log(erroMessage) {
        const nodeName = this.currentNodeRef.node.goalData.text;
        const styledErrorTitle = chalk_1.default.bold.red(`Error on node -> "${nodeName}"`);
        const styledErrorMessage = chalk_1.default.bold.red(erroMessage);
        const message = {
            nodeId: this.currentNodeRef.node.goalData.id,
            nodeName,
            message: erroMessage
        };
        const logMessage = `${styledErrorTitle}\n${styledErrorMessage}\n`;
        this.errorList.push(message);
        console.error(logMessage);
        this.errorCount++;
    }
}
exports.ErrorLogger = ErrorLogger;
ErrorLogger.currentNodeRef = {};
ErrorLogger.errorCount = 0;
ErrorLogger.errorList = [];
