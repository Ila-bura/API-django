"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseChannelObserver = void 0;
class BaseChannelObserver {
    constructor(channel) {
        this.channel = channel;
    }
    showChannel(preserveFocus) {
        this.channel.show(preserveFocus);
    }
    clearChannel() {
        this.channel.clear();
    }
}
exports.BaseChannelObserver = BaseChannelObserver;
//# sourceMappingURL=BaseChannelObserver.js.map