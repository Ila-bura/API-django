"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnisharpLoggerObserver = void 0;
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const os = require("os");
const EventType_1 = require("../omnisharp/EventType");
class OmnisharpLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpInitialisation:
                    this.handleOmnisharpInitialisation(event);
                    break;
                case EventType_1.EventType.OmnisharpLaunch:
                    this.handleOmnisharpLaunch(event);
                    break;
                case EventType_1.EventType.OmnisharpFailure:
                    this.logger.appendLine(event.message);
                    this.logger.appendLine();
                    break;
                case EventType_1.EventType.OmnisharpServerMessage:
                    this.logger.appendLine(event.message);
                    break;
                case EventType_1.EventType.OmnisharpServerOnServerError:
                    this.handleOmnisharpServerOnServerError(event);
                    break;
                case EventType_1.EventType.OmnisharpServerOnError:
                    this.handleOmnisharpServerOnError(event);
                    break;
                case EventType_1.EventType.OmnisharpServerMsBuildProjectDiagnostics:
                    this.handleOmnisharpServerMsBuildProjectDiagnostics(event);
                    break;
                case EventType_1.EventType.OmnisharpServerOnStdErr:
                    this.logger.append(event.message);
                    break;
                case EventType_1.EventType.OmnisharpEventPacketReceived:
                    this.handleOmnisharpEventPacketReceived(event);
                    break;
            }
        };
    }
    handleOmnisharpServerOnServerError(event) {
        this.logger.appendLine('[ERROR] ' + event.err);
    }
    handleOmnisharpInitialisation(event) {
        this.logger.appendLine(`Starting OmniSharp server at ${event.timeStamp.toLocaleString()}`);
        this.logger.increaseIndent();
        this.logger.appendLine(`Target: ${event.solutionPath}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleOmnisharpLaunch(event) {
        this.logger.append(`OmniSharp server started`);
        if (event.monoVersion) {
            this.logger.append(` with Mono ${event.monoVersion}`);
            if (event.monoPath !== undefined) {
                this.logger.append(` (${event.monoPath})`);
            }
        }
        this.logger.appendLine('.');
        this.logger.increaseIndent();
        this.logger.appendLine(`Path: ${event.command}`);
        this.logger.appendLine(`PID: ${event.pid}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleOmnisharpServerMsBuildProjectDiagnostics(event) {
        if (event.diagnostics.Errors.length > 0 || event.diagnostics.Warnings.length > 0) {
            this.logger.appendLine(event.diagnostics.FileName);
            event.diagnostics.Errors.forEach(error => {
                this.logger.appendLine(`${error.FileName}(${error.StartLine},${error.StartColumn}): Error: ${error.Text}`);
            });
            event.diagnostics.Warnings.forEach(warning => {
                this.logger.appendLine(`${warning.FileName}(${warning.StartLine},${warning.StartColumn}): Warning: ${warning.Text}`);
            });
            this.logger.appendLine("");
        }
    }
    handleOmnisharpServerOnError(event) {
        if (event.errorMessage.FileName) {
            this.logger.appendLine(`${event.errorMessage.FileName}(${event.errorMessage.Line},${event.errorMessage.Column})`);
        }
        this.logger.appendLine(event.errorMessage.Text);
        this.logger.appendLine("");
    }
    handleOmnisharpEventPacketReceived(event) {
        if (!this._isFilterableOutput(event)) {
            let output = `[${this.getLogLevelPrefix(event.logLevel)}]: ${event.name}${os.EOL}${event.message}`;
            const newLinePlusPadding = os.EOL + "        ";
            output = output.replace(os.EOL, newLinePlusPadding);
            this.logger.appendLine(output);
        }
    }
    _isFilterableOutput(event) {
        // filter messages like: /codecheck: 200 339ms
        const timing200Pattern = /^\/[\/\w]+: 200 \d+ms/;
        return event.logLevel === "INFORMATION"
            && event.name === "OmniSharp.Middleware.LoggingMiddleware"
            && timing200Pattern.test(event.message);
    }
    getLogLevelPrefix(logLevel) {
        switch (logLevel) {
            case "TRACE": return "trce";
            case "DEBUG": return "dbug";
            case "INFORMATION": return "info";
            case "WARNING": return "warn";
            case "ERROR": return "fail";
            case "CRITICAL": return "crit";
            default: throw new Error(`Unknown log level value: ${logLevel}`);
        }
    }
}
exports.OmnisharpLoggerObserver = OmnisharpLoggerObserver;
//# sourceMappingURL=OmnisharpLoggerObserver.js.map