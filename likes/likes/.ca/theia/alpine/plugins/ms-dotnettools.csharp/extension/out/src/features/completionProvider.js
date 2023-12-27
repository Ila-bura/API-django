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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _lastCompletions;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionAfterInsertCommand = void 0;
const vscode_1 = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const typeConversion_1 = require("../omnisharp/typeConversion");
exports.CompletionAfterInsertCommand = "csharp.completion.afterInsert";
class OmnisharpCompletionProvider extends abstractProvider_1.default {
    constructor(server, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        _lastCompletions.set(this, void 0);
    }
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = typeConversion_1.createRequest(document, position);
            request.CompletionTrigger = (context.triggerKind + 1);
            request.TriggerCharacter = context.triggerCharacter;
            try {
                const response = yield serverUtils.getCompletion(this._server, request, token);
                const mappedItems = response.Items.map(arg => this._convertToVscodeCompletionItem(arg));
                let lastCompletions = new Map();
                for (let i = 0; i < mappedItems.length; i++) {
                    lastCompletions.set(mappedItems[i], response.Items[i]);
                }
                __classPrivateFieldSet(this, _lastCompletions, lastCompletions);
                return { items: mappedItems };
            }
            catch (error) {
                return;
            }
        });
    }
    resolveCompletionItem(item, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastCompletions = __classPrivateFieldGet(this, _lastCompletions);
            if (!lastCompletions) {
                return item;
            }
            const lspItem = lastCompletions.get(item);
            if (!lspItem) {
                return item;
            }
            const request = { Item: lspItem };
            try {
                const response = yield serverUtils.getCompletionResolve(this._server, request, token);
                return this._convertToVscodeCompletionItem(response.Item);
            }
            catch (error) {
                return;
            }
        });
    }
    afterInsert(item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uri = vscode_1.window.activeTextEditor.document.uri;
                const response = yield serverUtils.getCompletionAfterInsert(this._server, { Item: item });
                if (!response.Changes || !response.Column || !response.Line) {
                    return;
                }
                let edit = new vscode_1.WorkspaceEdit();
                edit.set(uri, response.Changes.map(change => ({
                    newText: change.NewText,
                    range: new vscode_1.Range(new vscode_1.Position(change.StartLine, change.StartColumn), new vscode_1.Position(change.EndLine, change.EndColumn))
                })));
                edit = yield this._languageMiddlewareFeature.remap("remapWorkspaceEdit", edit, vscode_languageserver_protocol_1.CancellationToken.None);
                const applied = yield vscode_1.workspace.applyEdit(edit);
                if (!applied) {
                    return;
                }
                const responseLine = response.Line;
                const responseColumn = response.Column;
                const finalPosition = new vscode_1.Position(responseLine, responseColumn);
                vscode_1.window.activeTextEditor.selections = [new vscode_1.Selection(finalPosition, finalPosition)];
            }
            catch (error) {
                return;
            }
        });
    }
    _convertToVscodeCompletionItem(omnisharpCompletion) {
        var _a, _b, _c;
        const docs = omnisharpCompletion.Documentation ? new vscode_1.MarkdownString(omnisharpCompletion.Documentation, false) : undefined;
        const mapRange = function (edit) {
            const newStart = new vscode_1.Position(edit.StartLine, edit.StartColumn);
            const newEnd = new vscode_1.Position(edit.EndLine, edit.EndColumn);
            return new vscode_1.Range(newStart, newEnd);
        };
        const mapTextEdit = function (edit) {
            return new vscode_1.TextEdit(mapRange(edit), edit.NewText);
        };
        const additionalTextEdits = (_a = omnisharpCompletion.AdditionalTextEdits) === null || _a === void 0 ? void 0 : _a.map(mapTextEdit);
        const newText = (_c = (_b = omnisharpCompletion.TextEdit) === null || _b === void 0 ? void 0 : _b.NewText) !== null && _c !== void 0 ? _c : omnisharpCompletion.InsertText;
        const insertText = omnisharpCompletion.InsertTextFormat === vscode_languageserver_protocol_1.InsertTextFormat.Snippet
            ? new vscode_1.SnippetString(newText)
            : newText;
        const insertRange = omnisharpCompletion.TextEdit ? mapRange(omnisharpCompletion.TextEdit) : undefined;
        return {
            label: omnisharpCompletion.Label,
            kind: omnisharpCompletion.Kind - 1,
            detail: omnisharpCompletion.Detail,
            documentation: docs,
            commitCharacters: omnisharpCompletion.CommitCharacters,
            preselect: omnisharpCompletion.Preselect,
            filterText: omnisharpCompletion.FilterText,
            insertText: insertText,
            range: insertRange,
            tags: omnisharpCompletion.Tags,
            sortText: omnisharpCompletion.SortText,
            additionalTextEdits: additionalTextEdits,
            keepWhitespace: true,
            command: omnisharpCompletion.HasAfterInsertStep ? { command: exports.CompletionAfterInsertCommand, title: "", arguments: [omnisharpCompletion] } : undefined
        };
    }
}
exports.default = OmnisharpCompletionProvider;
_lastCompletions = new WeakMap();
//# sourceMappingURL=completionProvider.js.map