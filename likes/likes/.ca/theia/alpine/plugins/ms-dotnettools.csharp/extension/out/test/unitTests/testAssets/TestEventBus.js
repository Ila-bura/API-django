"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Disposable_1 = require("../../../src/Disposable");
class TestEventBus {
    constructor(eventStream) {
        this.eventBus = [];
        this.disposable = new Disposable_1.default(eventStream.subscribe(event => this.eventBus.push(event)));
    }
    getEvents() {
        return this.eventBus;
    }
    dispose() {
        this.disposable.dispose();
    }
}
exports.default = TestEventBus;
//# sourceMappingURL=TestEventBus.js.map