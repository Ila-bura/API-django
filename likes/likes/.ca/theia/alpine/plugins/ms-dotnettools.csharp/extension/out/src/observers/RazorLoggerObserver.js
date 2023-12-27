"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorLoggerObserver = void 0;
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const EventType_1 = require("../omnisharp/EventType");
class RazorLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.RazorPluginPathSpecified:
                    this.handleRazorPluginPathSpecifiedMessage(event);
                    break;
                case EventType_1.EventType.RazorPluginPathDoesNotExist:
                    this.handleRazorPluginPathDoesNotExistMessage(event);
                    break;
                case EventType_1.EventType.RazorDevModeActive:
                    this.handleRazorDevMode();
                    break;
            }
        };
    }
    handleRazorPluginPathSpecifiedMessage(event) {
        this.logger.appendLine('Razor Plugin Path Specified');
        this.logger.increaseIndent();
        this.logger.appendLine(`Path: ${event.path}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleRazorPluginPathDoesNotExistMessage(event) {
        this.logger.appendLine(`[error]: Razor plugin path was specified as '${event.path}' but does not exist on disk.`);
    }
    handleRazorDevMode() {
        this.logger.appendLine('Razor dev mode active. Suppressing built-in OmniSharp Razor support.');
        this.logger.appendLine();
    }
}
exports.RazorLoggerObserver = RazorLoggerObserver;
//# sourceMappingURL=RazorLoggerObserver.js.map