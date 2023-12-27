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
const child_process_1 = require("child_process");
function spawnGit(args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options) {
            options = {
                env: {}
            };
        }
        let optionsWithFullEnvironment = Object.assign(Object.assign({}, options), { env: Object.assign(Object.assign({}, process.env), options.env) });
        const buffer = child_process_1.spawnSync('git', args, optionsWithFullEnvironment);
        return { code: buffer.status, signal: buffer.signal };
    });
}
exports.default = spawnGit;
//# sourceMappingURL=spawnGit.js.map