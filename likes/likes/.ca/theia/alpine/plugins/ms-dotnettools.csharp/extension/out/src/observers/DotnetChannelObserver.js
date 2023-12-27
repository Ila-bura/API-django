"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetChannelObserver = void 0;
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const EventType_1 = require("../omnisharp/EventType");
class DotNetChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.CommandDotNetRestoreStart:
                    this.clearChannel();
                    this.showChannel(true);
                    break;
            }
        };
    }
}
exports.DotNetChannelObserver = DotNetChannelObserver;
//# sourceMappingURL=DotnetChannelObserver.js.map