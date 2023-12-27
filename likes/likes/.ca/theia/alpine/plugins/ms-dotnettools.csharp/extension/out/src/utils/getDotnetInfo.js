"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotnetInfo = exports.getDotnetInfo = exports.DOTNET_MISSING_MESSAGE = void 0;
const common_1 = require("../common");
exports.DOTNET_MISSING_MESSAGE = "A valid dotnet installation could not be found.";
let _dotnetInfo;
// This function checks for the presence of dotnet on the path and ensures the Version
// is new enough for us.
// Returns: a promise that returns a DotnetInfo class
// Throws: An DotNetCliError() from the return promise if either dotnet does not exist or is too old.
function getDotnetInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (_dotnetInfo !== undefined) {
            return _dotnetInfo;
        }
        let dotnetInfo = new DotnetInfo();
        try {
            let data = yield common_1.execChildProcess('dotnet --info', process.cwd());
            dotnetInfo.FullInfo = data;
            let lines = data.replace(/\r/mg, '').split('\n');
            lines.forEach(line => {
                let match;
                if (match = /^\ Version:\s*([^\s].*)$/.exec(line)) {
                    dotnetInfo.Version = match[1];
                }
                else if (match = /^\ OS Version:\s*([^\s].*)$/.exec(line)) {
                    dotnetInfo.OsVersion = match[1];
                }
                else if (match = /^\ RID:\s*([\w\-\.]+)$/.exec(line)) {
                    dotnetInfo.RuntimeId = match[1];
                }
            });
            _dotnetInfo = dotnetInfo;
        }
        catch (_a) {
            // something went wrong with spawning 'dotnet --info'
            dotnetInfo.FullInfo = exports.DOTNET_MISSING_MESSAGE;
        }
        return dotnetInfo;
    });
}
exports.getDotnetInfo = getDotnetInfo;
class DotnetInfo {
}
exports.DotnetInfo = DotnetInfo;
//# sourceMappingURL=getDotnetInfo.js.map