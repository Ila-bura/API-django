"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const rxjs_1 = require("rxjs");
class Disposable {
    constructor(onDispose) {
        this.dispose = () => {
            this.onDispose();
        };
        if (!onDispose) {
            throw new Error("onDispose cannot be null or empty.");
        }
        if (onDispose instanceof rxjs_1.Subscription) {
            this.onDispose = () => onDispose.unsubscribe();
        }
        else {
            this.onDispose = onDispose;
        }
    }
}
exports.default = Disposable;
//# sourceMappingURL=Disposable.js.map