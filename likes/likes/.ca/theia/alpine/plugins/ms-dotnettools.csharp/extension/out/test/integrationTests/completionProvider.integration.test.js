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
const completionProvider_1 = require("../../src/features/completionProvider");
const vscode = require("vscode");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const path = require("path");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
suite(`${completionProvider_1.default.name}: Returns the completion items`, () => {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'completion.cs';
            let dir = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            fileUri = vscode.Uri.file(path.join(dir, fileName));
            yield vscode.commands.executeCommand("vscode.open", fileUri);
            // The override bit is commented out to allow later debugging to work correctly.
            let overrideUncomment = new vscode.WorkspaceEdit();
            overrideUncomment.delete(fileUri, new vscode.Range(new vscode.Position(11, 8), new vscode.Position(11, 11)));
            yield vscode.workspace.applyEdit(overrideUncomment);
        });
    });
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns the completion items", () => __awaiter(void 0, void 0, void 0, function* () {
        let completionList = (yield vscode.commands.executeCommand("vscode.executeCompletionItemProvider", fileUri, new vscode.Position(8, 31), " "));
        chai_1.expect(completionList.items).to.not.be.empty;
    }));
    test("Resolve adds documentation", () => __awaiter(void 0, void 0, void 0, function* () {
        let completionList = (yield vscode.commands.executeCommand("vscode.executeCompletionItemProvider", fileUri, new vscode.Position(8, 31), /*trigger character*/ undefined, /* completions to resolve */ 10));
        // At least some of the first 10 fully-resolved elements should have documentation attached. If this ever ends up not being
        // true, adjust the cutoff appropriately.
        const documentation = completionList.items.slice(0, 9).filter(item => item.documentation);
        chai_1.expect(documentation).to.not.be.empty;
    }));
    test("Override completion has additional edits sync", () => __awaiter(void 0, void 0, void 0, function* () {
        let completionList = (yield vscode.commands.executeCommand("vscode.executeCompletionItemProvider", fileUri, new vscode.Position(11, 17), " ", 4));
        const nonSnippets = completionList.items.filter(c => c.kind != vscode.CompletionItemKind.Snippet);
        let sawAdditionalTextEdits = false;
        let sawEmptyAdditionalTextEdits = false;
        for (const i of nonSnippets) {
            chai_1.expect(i.insertText.value).contains("$0");
            if (i.additionalTextEdits) {
                sawAdditionalTextEdits = true;
                chai_1.expect(i.additionalTextEdits).to.be.array();
                chai_1.expect(i.additionalTextEdits.length).to.equal(1);
                chai_1.expect(i.additionalTextEdits[0].newText).to.equal("using singleCsproj2;\n");
                chai_1.expect(i.additionalTextEdits[0].range.start.line).to.equal(1);
                chai_1.expect(i.additionalTextEdits[0].range.start.character).to.equal(0);
                chai_1.expect(i.additionalTextEdits[0].range.end.line).to.equal(1);
                // Can be either 0 or 1, depending on the platform this test is run on
                chai_1.expect(i.additionalTextEdits[0].range.end.character).to.be.lessThanOrEqual(1).and.greaterThanOrEqual(0);
            }
            else {
                sawEmptyAdditionalTextEdits = true;
            }
        }
        chai_1.expect(sawAdditionalTextEdits).to.be.true;
        chai_1.expect(sawEmptyAdditionalTextEdits).to.be.true;
    }));
});
//# sourceMappingURL=completionProvider.integration.test.js.map