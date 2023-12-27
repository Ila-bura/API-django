"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeNode = void 0;
const cp = require("child_process");
function invokeNode(args) {
    let proc = cp.spawnSync('node', args);
    if (proc.error) {
        console.error(proc.error.toString());
    }
}
exports.invokeNode = invokeNode;
//# sourceMappingURL=testAssets.js.map