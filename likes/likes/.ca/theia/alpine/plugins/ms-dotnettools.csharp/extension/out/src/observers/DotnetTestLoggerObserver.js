"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOutcome = void 0;
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const protocol = require("../omnisharp/protocol");
const EventType_1 = require("../omnisharp/EventType");
class DotNetTestLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.DotNetTestRunStart:
                    this.handleDotnetTestRunStart(event);
                    break;
                case EventType_1.EventType.DotNetTestMessage:
                    this.logger.appendLine(event.message);
                    break;
                case EventType_1.EventType.ReportDotNetTestResults:
                    this.handleReportDotnetTestResults(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugStart:
                    this.handleDotnetTestDebugStart(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugWarning:
                    this.handleDotNetTestDebugWarning(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugProcessStart:
                    this.handleDotNetTestDebugProcessStart(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugComplete:
                    this.logger.appendLine("Debugging complete.\n");
                    break;
                case EventType_1.EventType.DotNetTestsInClassDebugStart:
                    this.handleDotnetTestsInClassDebugStart(event);
                    break;
                case EventType_1.EventType.DotNetTestsInClassRunStart:
                    this.handleDotnetTestsInClassRunStart(event);
                    break;
                case EventType_1.EventType.DotNetTestRunInContextStart:
                    this.handleDotnetTestsRunInContextStart(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugInContextStart:
                    this.handleDotnetTestsDebugInContextStart(event);
                    break;
            }
        };
    }
    handleDotNetTestDebugWarning(event) {
        this.logger.appendLine(`Warning: ${event.message}`);
    }
    handleDotnetTestDebugStart(event) {
        this.logger.appendLine(`----- Debugging test method ${event.testMethod} -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestRunStart(event) {
        this.logger.appendLine(`----- Running test method "${event.testMethod}" -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsInClassDebugStart(event) {
        this.logger.appendLine(`----- Debugging tests in class ${event.className} -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsInClassRunStart(event) {
        this.logger.appendLine(`----- Running tests in class "${event.className}" -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsRunInContextStart(event) {
        this.logger.appendLine(`----- Running test(s) in context "${event.fileName}(${event.line + 1},${event.column + 1})" -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsDebugInContextStart(event) {
        this.logger.appendLine(`----- Debugging test(s) in context "${event.fileName}(${event.line + 1},${event.column + 1})" -----`);
        this.logger.appendLine('');
    }
    handleDotNetTestDebugProcessStart(event) {
        this.logger.appendLine(`Started debugging process #${event.targetProcessId}.`);
    }
    handleReportDotnetTestResults(event) {
        if (event.results) {
            this.logger.appendLine("----- Test Execution Summary -----");
            this.logger.appendLine('');
            // Omnisharp returns null results if there are build failures
            const results = event.results;
            const totalTests = results.length;
            let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
            for (let result of results) {
                this.logTestResult(result);
                switch (result.Outcome) {
                    case protocol.V2.TestOutcomes.Failed:
                        totalFailed += 1;
                        break;
                    case protocol.V2.TestOutcomes.Passed:
                        totalPassed += 1;
                        break;
                    case protocol.V2.TestOutcomes.Skipped:
                        totalSkipped += 1;
                        break;
                }
            }
            this.logger.appendLine(`Total tests: ${totalTests}. Passed: ${totalPassed}. Failed: ${totalFailed}. Skipped: ${totalSkipped}`);
            this.logger.appendLine('');
        }
    }
    logTestResult(result) {
        this.logger.appendLine(`${result.MethodName}:`);
        this.logger.increaseIndent();
        this.logger.appendLine(`Outcome: ${processOutcome(result.Outcome)}`);
        if (result.ErrorMessage) {
            this.logger.appendLine(`Error Message:`);
            this.logger.appendLine(result.ErrorMessage);
        }
        if (result.ErrorStackTrace) {
            this.logger.appendLine(`Stack Trace:`);
            this.logger.appendLine(result.ErrorStackTrace);
        }
        if (result.StandardOutput && result.StandardOutput.length > 0) {
            this.logger.appendLine("Standard Output Messages:");
            result.StandardOutput.forEach(message => this.logger.appendLine(message));
        }
        if (result.StandardError && result.StandardError.length > 0) {
            this.logger.appendLine("Standard Error Messages:");
            result.StandardError.forEach(message => this.logger.appendLine(message));
        }
        this.logger.appendLine();
        this.logger.decreaseIndent();
    }
}
exports.default = DotNetTestLoggerObserver;
function processOutcome(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}
exports.processOutcome = processOutcome;
//# sourceMappingURL=DotnetTestLoggerObserver.js.map