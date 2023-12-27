"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandLineOptions = void 0;
const minimist = require("minimist");
const path = require("path");
let argv = minimist(process.argv.slice(2), {
    boolean: ['retainVsix']
});
exports.commandLineOptions = {
    retainVsix: !!argv['retainVsix'],
    outputFolder: makePathAbsolute(argv['o']),
    codeExtensionPath: makePathAbsolute(argv['codeExtensionPath'])
};
function makePathAbsolute(originalPath) {
    if (!originalPath || originalPath == '') {
        return undefined;
    }
    return path.resolve(originalPath);
}
//# sourceMappingURL=commandLineArguments.js.map