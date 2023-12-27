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
function showInformationMessage(vscode, message, ...items) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let value = yield vscode.window.showInformationMessage(message, ...items);
            if (value && value.command) {
                vscode.commands.executeCommand(value.command);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = showInformationMessage;
//# sourceMappingURL=ShowInformationMessage.js.map