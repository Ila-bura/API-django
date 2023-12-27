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
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConversion_1 = require("../omnisharp/typeConversion");
const vscode_1 = require("vscode");
class OmnisharpRenameProvider extends abstractProvider_1.default {
    provideRenameEdits(document, position, newName, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.WantsTextChanges = true;
            req.RenameTo = newName;
            req.ApplyTextChanges = false;
            try {
                let response = yield serverUtils.rename(this._server, req, token);
                if (!response) {
                    return undefined;
                }
                const edit = new vscode_1.WorkspaceEdit();
                response.Changes.forEach(change => {
                    const uri = vscode_1.Uri.file(change.FileName);
                    change.Changes.forEach(change => {
                        edit.replace(uri, new vscode_1.Range(change.StartLine, change.StartColumn, change.EndLine, change.EndColumn), change.NewText);
                    });
                });
                // Allow language middlewares to re-map its edits if necessary.
                const result = yield this._languageMiddlewareFeature.remap("remapWorkspaceEdit", edit, token);
                return result;
            }
            catch (error) {
                return undefined;
            }
        });
    }
}
exports.default = OmnisharpRenameProvider;
//# sourceMappingURL=renameProvider.js.map