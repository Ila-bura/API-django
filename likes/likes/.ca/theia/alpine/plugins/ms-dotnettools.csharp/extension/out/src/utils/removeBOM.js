"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBOMFromString = exports.removeBOMFromBuffer = void 0;
const removeBomBuffer = require("strip-bom-buf");
const strip_bom_1 = require("strip-bom");
function removeBOMFromBuffer(buffer) {
    return removeBomBuffer(buffer);
}
exports.removeBOMFromBuffer = removeBOMFromBuffer;
function removeBOMFromString(line) {
    return strip_bom_1.default(line.trim());
}
exports.removeBOMFromString = removeBOMFromString;
//# sourceMappingURL=removeBOM.js.map