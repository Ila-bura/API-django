"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const Disposable_1 = require("./Disposable");
class CompositeDisposable extends Disposable_1.default {
    constructor(...disposables) {
        super(() => this.disposables.unsubscribe());
        this.disposables = new rxjs_1.Subscription();
        for (const disposable of disposables) {
            if (disposable) {
                this.add(disposable);
            }
            else {
                throw new Error("null disposables are not supported");
            }
        }
    }
    add(disposable) {
        if (!disposable) {
            throw new Error("disposable cannot be null");
        }
        this.disposables.add(() => disposable.dispose());
    }
}
exports.default = CompositeDisposable;
//# sourceMappingURL=CompositeDisposable.js.map