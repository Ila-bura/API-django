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
exports.getMonoVersion = void 0;
const child_process_1 = require("child_process");
const getMonoVersion = (environment) => __awaiter(void 0, void 0, void 0, function* () {
    const versionRegexp = /(\d+\.\d+\.\d+)/;
    return new Promise((resolve, reject) => {
        let childprocess;
        try {
            childprocess = child_process_1.spawn('mono', ['--version'], { env: environment });
        }
        catch (e) {
            return resolve(undefined);
        }
        childprocess.on('error', function (err) {
            resolve(undefined);
        });
        let stdout = '';
        childprocess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        childprocess.stdout.on('close', () => {
            let match = versionRegexp.exec(stdout);
            if (match && match.length > 1) {
                resolve(match[1]);
            }
            else {
                resolve(undefined);
            }
        });
    });
});
exports.getMonoVersion = getMonoVersion;
//# sourceMappingURL=getMonoVersion.js.map