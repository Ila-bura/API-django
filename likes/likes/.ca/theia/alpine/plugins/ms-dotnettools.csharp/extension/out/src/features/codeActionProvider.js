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
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const CompositeDisposable_1 = require("../CompositeDisposable");
const fileOperationsResponseEditBuilder_1 = require("../omnisharp/fileOperationsResponseEditBuilder");
class CodeActionProvider extends abstractProvider_1.default {
    constructor(server, optionProvider, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this.optionProvider = optionProvider;
        this._commandId = 'omnisharp.runCodeAction';
        let registerCommandDisposable = vscode.commands.registerCommand(this._commandId, this._runCodeAction, this);
        this.addDisposables(new CompositeDisposable_1.default(registerCommandDisposable));
    }
    provideCodeActions(document, range, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.optionProvider.GetLatestOptions();
            if (options.disableCodeActions) {
                return;
            }
            let line;
            let column;
            let selection;
            // VS Code will pass the range of the word at the editor caret, even if there isn't a selection.
            // To ensure that we don't suggest selection-based refactorings when there isn't a selection, we first
            // find the text editor for this document and verify that there is a selection.
            let editor = vscode.window.visibleTextEditors.find(e => e.document === document);
            if (editor) {
                if (editor.selection.isEmpty) {
                    // The editor does not have a selection. Use the active position of the selection (i.e. the caret).
                    let active = editor.selection.active;
                    line = active.line;
                    column = active.character;
                }
                else {
                    // The editor has a selection. Use it.
                    let start = editor.selection.start;
                    let end = editor.selection.end;
                    selection = {
                        Start: { Line: start.line, Column: start.character },
                        End: { Line: end.line, Column: end.character }
                    };
                }
            }
            else {
                // We couldn't find the editor, so just use the range we were provided.
                selection = {
                    Start: { Line: range.start.line, Column: range.start.character },
                    End: { Line: range.end.line, Column: range.end.character }
                };
            }
            let request = {
                FileName: document.fileName,
                Line: line,
                Column: column,
                Selection: selection
            };
            try {
                let response = yield serverUtils.getCodeActions(this._server, request, token);
                return response.CodeActions.map(codeAction => {
                    let runRequest = {
                        FileName: document.fileName,
                        Line: line,
                        Column: column,
                        Selection: selection,
                        Identifier: codeAction.Identifier,
                        WantsTextChanges: true,
                        WantsAllCodeActionOperations: true,
                        ApplyTextChanges: false
                    };
                    return {
                        title: codeAction.Name,
                        command: this._commandId,
                        arguments: [runRequest, token]
                    };
                });
            }
            catch (error) {
                return Promise.reject(`Problem invoking 'GetCodeActions' on OmniSharp server: ${error}`);
            }
        });
    }
    _runCodeAction(req, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return serverUtils.runCodeAction(this._server, req).then((response) => __awaiter(this, void 0, void 0, function* () {
                if (response) {
                    return fileOperationsResponseEditBuilder_1.buildEditForResponse(response.Changes, this._languageMiddlewareFeature, token);
                }
            }), (error) => __awaiter(this, void 0, void 0, function* () {
                return Promise.reject(`Problem invoking 'RunCodeAction' on OmniSharp server: ${error}`);
            }));
        });
    }
}
exports.default = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map