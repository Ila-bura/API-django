"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmptyOptions = void 0;
const options_1 = require("../../../src/omnisharp/options");
function getEmptyOptions() {
    return new options_1.Options("", "", false, "", false, 0, 0, false, false, false, false, false, [], false, false, false, 0, 0, false, false, false, false, false, false, false, false, undefined, "", "");
}
exports.getEmptyOptions = getEmptyOptions;
//# sourceMappingURL=FakeOptions.js.map