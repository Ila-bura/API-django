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
exports.FixAllProvider = void 0;
const vscode = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol = require("../omnisharp/protocol");
const protocol_1 = require("../omnisharp/protocol");
const CompositeDisposable_1 = require("../CompositeDisposable");
const abstractProvider_1 = require("./abstractProvider");
const fileOperationsResponseEditBuilder_1 = require("../omnisharp/fileOperationsResponseEditBuilder");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
class FixAllProvider extends abstractProvider_1.default {
    constructor(server, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this.server = server;
        let disposable = new CompositeDisposable_1.default();
        disposable.add(vscode.commands.registerCommand('o.fixAll.solution', () => __awaiter(this, void 0, void 0, function* () { return this.fixAllMenu(server, protocol.FixAllScope.Solution); })));
        disposable.add(vscode.commands.registerCommand('o.fixAll.project', () => __awaiter(this, void 0, void 0, function* () { return this.fixAllMenu(server, protocol.FixAllScope.Project); })));
        disposable.add(vscode.commands.registerCommand('o.fixAll.document', () => __awaiter(this, void 0, void 0, function* () { return this.fixAllMenu(server, protocol.FixAllScope.Document); })));
        this.addDisposables(disposable);
    }
    provideCodeActions(document, _range, context, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(context);
            if (!context.only) {
                return [];
            }
            if (context.only.value === "source.fixAll.csharp") {
                yield this.applyFixes(document.fileName, protocol_1.FixAllScope.Document, undefined);
            }
            return [];
        });
    }
    fixAllMenu(server, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            let availableFixes = yield serverUtils.getFixAll(server, { FileName: vscode.window.activeTextEditor.document.fileName, Scope: scope });
            let targets = availableFixes.Items.map(x => `${x.Id}: ${x.Message}`);
            if (scope === protocol.FixAllScope.Document) {
                targets = ["Fix all issues", ...targets];
            }
            return vscode.window.showQuickPick(targets, {
                matchOnDescription: true,
                placeHolder: `Select fix all action`
            }).then((selectedAction) => __awaiter(this, void 0, void 0, function* () {
                let filter = undefined;
                if (selectedAction === undefined) {
                    return;
                }
                if (selectedAction !== "Fix all issues") {
                    let actionTokens = selectedAction.split(":");
                    filter = [{ Id: actionTokens[0], Message: actionTokens[1] }];
                }
                yield this.applyFixes(vscode.window.activeTextEditor.document.fileName, scope, filter);
            }));
        });
    }
    applyFixes(fileName, scope, fixAllFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield serverUtils.runFixAll(this.server, {
                FileName: fileName,
                Scope: scope,
                FixAllFilter: fixAllFilter,
                WantsAllCodeActionOperations: true,
                WantsTextChanges: true,
                ApplyChanges: false
            });
            if (response) {
                return fileOperationsResponseEditBuilder_1.buildEditForResponse(response.Changes, this._languageMiddlewareFeature, vscode_languageserver_protocol_1.CancellationToken.None);
            }
        });
    }
}
exports.FixAllProvider = FixAllProvider;
//# sourceMappingURL=fixAllProvider.js.map