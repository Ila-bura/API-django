"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CompositeDisposable_1 = require("../CompositeDisposable");
class AbstractProvider {
    constructor(server, languageMiddlewareFeature) {
        this.dispose = () => {
            this._disposables.dispose();
        };
        this._server = server;
        this._languageMiddlewareFeature = languageMiddlewareFeature;
        this._disposables = new CompositeDisposable_1.default();
    }
    addDisposables(disposables) {
        this._disposables.add(disposables);
    }
}
exports.default = AbstractProvider;
//# sourceMappingURL=abstractProvider.js.map