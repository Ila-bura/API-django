"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotnetLoggerObserver = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const EventType_1 = require("../omnisharp/EventType");
class DotnetLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.CommandDotNetRestoreProgress:
                    this.logger.append(event.message);
                    break;
                case EventType_1.EventType.CommandDotNetRestoreSucceeded:
                    this.logger.appendLine(event.message);
                    break;
                case EventType_1.EventType.CommandDotNetRestoreFailed:
                    this.logger.appendLine(event.message);
                    break;
            }
        };
    }
}
exports.DotnetLoggerObserver = DotnetLoggerObserver;
//# sourceMappingURL=DotnetLoggerObserver.js.map