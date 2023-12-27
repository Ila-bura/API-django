"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const EventType_1 = require("../omnisharp/EventType");
class DotnetTestChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.DotNetTestRunStart:
                case EventType_1.EventType.DotNetTestRunFailure:
                case EventType_1.EventType.DotNetTestsInClassRunStart:
                case EventType_1.EventType.DotNetTestDebugStart:
                case EventType_1.EventType.DotNetTestsInClassDebugStart:
                case EventType_1.EventType.DotNetTestRunInContextStart:
                case EventType_1.EventType.DotNetTestDebugInContextStart:
                    this.showChannel(true);
                    break;
            }
        };
    }
}
exports.default = DotnetTestChannelObserver;
//# sourceMappingURL=DotnetTestChannelObserver.js.map