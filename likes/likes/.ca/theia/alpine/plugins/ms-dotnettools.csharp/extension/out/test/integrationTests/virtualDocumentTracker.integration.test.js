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
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`Virtual Document Tracking ${testAssetWorkspace_1.default.description}`, function () {
    const virtualScheme = "virtual";
    let virtualDocumentRegistration;
    let virtualUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            const virtualCSharpDocumentProvider = new VirtualCSharpDocumentProvider();
            virtualDocumentRegistration = vscode.workspace.registerTextDocumentContentProvider(virtualScheme, virtualCSharpDocumentProvider);
            virtualUri = vscode.Uri.parse(`${virtualScheme}://${testAssetWorkspace_1.default.projects[0].projectDirectoryPath}/_virtualFile.cs`);
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
        virtualDocumentRegistration.dispose();
    }));
    test("Virtual documents are operated on.", () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.openTextDocument(virtualUri);
        let position = new vscode.Position(2, 0);
        let completionItems = yield vscode.commands.executeCommand("vscode.executeCompletionItemProvider", virtualUri, position);
        chai_1.assert.include(completionItems.items.map(({ label }) => label), "while");
    }));
});
class VirtualCSharpDocumentProvider {
    provideTextDocumentContent(uri, token) {
        return `namespace Test
{

}`;
    }
}
//# sourceMappingURL=virtualDocumentTracker.integration.test.js.map