"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnisharpDebugModeLoggerObserver = void 0;
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const os = require("os");
const EventType_1 = require("../omnisharp/EventType");
class OmnisharpDebugModeLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpRequestMessage:
                    this.handleOmnisharpRequestMessage(event);
                    break;
                case EventType_1.EventType.OmnisharpServerEnqueueRequest:
                    this.handleOmnisharpServerEnqueueRequest(event);
                    break;
                case EventType_1.EventType.OmnisharpServerDequeueRequest:
                    this.handleOmnisharpServerDequeueRequest(event);
                    break;
                case EventType_1.EventType.OmnisharpServerRequestCancelled:
                    this.handleOmnisharpServerRequestCancelled(event);
                    break;
                case EventType_1.EventType.OmnisharpServerProcessRequestStart:
                    this.handleOmnisharpProcessRequestStart(event);
                    break;
                case EventType_1.EventType.OmnisharpServerProcessRequestComplete:
                    this.logger.decreaseIndent();
                    break;
                case EventType_1.EventType.OmnisharpServerVerboseMessage:
                    this.handleOmnisharpServerVerboseMessage(event);
                    break;
                case EventType_1.EventType.OmnisharpEventPacketReceived:
                    this.handleOmnisharpEventPacketReceived(event);
                    break;
            }
        };
    }
    handleOmnisharpRequestMessage(event) {
        this.logger.append(`makeRequest: ${event.request.command} (${event.id})`);
        if (event.request.data) {
            this.logger.append(`, data=${JSON.stringify(event.request.data)}`);
        }
        this.logger.appendLine();
    }
    handleOmnisharpServerEnqueueRequest(event) {
        this.logger.appendLine(`Enqueue to ${event.queueName} request for ${event.command}.`);
        this.logger.appendLine();
    }
    handleOmnisharpServerDequeueRequest(event) {
        this.logger.appendLine(`Dequeue from ${event.queueName} with status ${event.queueStatus} request for ${event.command}${event.id ? ` (${event.id})` : ''}.`);
        this.logger.appendLine();
    }
    handleOmnisharpServerRequestCancelled(event) {
        this.logger.appendLine(`Cancelled request for ${event.command} (${event.id}).`);
        this.logger.appendLine();
    }
    handleOmnisharpProcessRequestStart(event) {
        this.logger.appendLine(`Processing ${event.name} queue, available slots ${event.availableRequestSlots}`);
        this.logger.increaseIndent();
    }
    handleOmnisharpServerVerboseMessage(event) {
        this.logger.appendLine(event.message);
    }
    handleOmnisharpEventPacketReceived(event) {
        if (this._isFilterableOutput(event)) {
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
exports.OmnisharpDebugModeLoggerObserver = OmnisharpDebugModeLoggerObserver;
//# sourceMappingURL=OmnisharpDebugModeLoggerObserver.js.map