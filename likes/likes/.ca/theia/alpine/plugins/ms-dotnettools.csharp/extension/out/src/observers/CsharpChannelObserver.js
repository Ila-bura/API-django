"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsharpChannelObserver = void 0;
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const EventType_1 = require("../omnisharp/EventType");
class CsharpChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.PackageInstallStart:
                case EventType_1.EventType.IntegrityCheckFailure:
                case EventType_1.EventType.InstallationFailure:
                case EventType_1.EventType.DebuggerNotInstalledFailure:
                case EventType_1.EventType.DebuggerPrerequisiteFailure:
                case EventType_1.EventType.ProjectJsonDeprecatedWarning:
                    this.showChannel(true);
                    break;
            }
        };
    }
}
exports.CsharpChannelObserver = CsharpChannelObserver;
//# sourceMappingURL=CsharpChannelObserver.js.map