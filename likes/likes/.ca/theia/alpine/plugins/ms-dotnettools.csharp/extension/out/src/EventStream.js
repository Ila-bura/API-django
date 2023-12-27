"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStream = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const rxjs_1 = require("rxjs");
class EventStream {
    constructor() {
        this.sink = new rxjs_1.Subject();
    }
    post(event) {
        this.sink.next(event);
    }
    subscribe(eventHandler) {
        return this.sink.subscribe(eventHandler);
    }
}
exports.EventStream = EventStream;
//# sourceMappingURL=EventStream.js.map