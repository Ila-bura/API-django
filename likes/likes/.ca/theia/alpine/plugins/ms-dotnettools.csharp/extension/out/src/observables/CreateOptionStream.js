"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../omnisharp/options");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function createOptionStream(vscode) {
    return rxjs_1.Observable.create((observer) => {
        let disposable = vscode.workspace.onDidChangeConfiguration(e => {
            //if the omnisharp or csharp configuration are affected only then read the options
            if (e.affectsConfiguration('omnisharp') || e.affectsConfiguration('csharp')) {
                observer.next(options_1.Options.Read(vscode));
            }
        });
        return () => disposable.dispose();
    }).pipe(operators_1.publishBehavior(options_1.Options.Read(vscode))).refCount();
}
exports.default = createOptionStream;
//# sourceMappingURL=CreateOptionStream.js.map