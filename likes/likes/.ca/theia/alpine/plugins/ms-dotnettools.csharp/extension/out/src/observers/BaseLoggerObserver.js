"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLoggerObserver = void 0;
const logger_1 = require("../logger");
class BaseLoggerObserver {
    constructor(channel) {
        if (channel instanceof logger_1.Logger) {
            this.logger = channel;
        }
        else {
            this.logger = new logger_1.Logger((message) => channel.append(message));
        }
    }
}
exports.BaseLoggerObserver = BaseLoggerObserver;
//# sourceMappingURL=BaseLoggerObserver.js.map