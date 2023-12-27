"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsolutePath = void 0;
const path_1 = require("path");
class AbsolutePath {
    constructor(value) {
        this.value = value;
        if (!path_1.isAbsolute(value)) {
            throw new Error("The path must be absolute");
        }
    }
    static getAbsolutePath(...pathSegments) {
        return new AbsolutePath(path_1.resolve(...pathSegments));
    }
}
exports.AbsolutePath = AbsolutePath;
//# sourceMappingURL=AbsolutePath.js.map