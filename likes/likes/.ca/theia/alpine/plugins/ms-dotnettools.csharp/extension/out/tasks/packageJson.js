"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJSON = void 0;
const fs = require("fs");
function getPackageJSON() {
    return JSON.parse(fs.readFileSync('package.json').toString());
}
exports.getPackageJSON = getPackageJSON;
//# sourceMappingURL=packageJson.js.map