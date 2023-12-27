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
exports.buildEditForResponse = void 0;
const vscode = require("vscode");
const protocol_1 = require("./protocol");
const typeConversion_1 = require("./typeConversion");
function buildEditForResponse(changes, languageMiddlewareFeature, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let edit = new vscode.WorkspaceEdit();
        let fileToOpen = null;
        if (!changes || !Array.isArray(changes) || !changes.length) {
            return true;
        }
        for (const change of changes) {
            if (change.ModificationType == protocol_1.FileModificationType.Opened) {
                // The CodeAction requested that we open a file.
                // Record that file name and keep processing CodeActions.
                // If a CodeAction requests that we open multiple files
                // we only open the last one (what would it mean to open multiple files?)
                fileToOpen = vscode.Uri.file(change.FileName);
            }
            if (change.ModificationType == protocol_1.FileModificationType.Modified) {
                const modifiedChange = change;
                const uri = vscode.Uri.file(modifiedChange.FileName);
                let edits = [];
                for (let textChange of modifiedChange.Changes) {
                    edits.push(vscode.TextEdit.replace(typeConversion_1.toRange2(textChange), textChange.NewText));
                }
                edit.set(uri, edits);
            }
        }
        for (const change of changes) {
            if (change.ModificationType == protocol_1.FileModificationType.Renamed) {
                const renamedChange = change;
                edit.renameFile(vscode.Uri.file(renamedChange.FileName), vscode.Uri.file(renamedChange.NewFileName));
            }
        }
        // Allow language middlewares to re-map its edits if necessary.
        edit = yield languageMiddlewareFeature.remap("remapWorkspaceEdit", edit, token);
        const applyEditPromise = vscode.workspace.applyEdit(edit);
        // Unfortunately, the textEditor.Close() API has been deprecated
        // and replaced with a command that can only close the active editor.
        // If files were renamed that weren't the active editor, their tabs will
        // be left open and marked as "deleted" by VS Code
        return fileToOpen != null
            ? applyEditPromise.then(_ => {
                return vscode.commands.executeCommand("vscode.open", fileToOpen);
            })
            : applyEditPromise;
    });
}
exports.buildEditForResponse = buildEditForResponse;
//# sourceMappingURL=fileOperationsResponseEditBuilder.js.map