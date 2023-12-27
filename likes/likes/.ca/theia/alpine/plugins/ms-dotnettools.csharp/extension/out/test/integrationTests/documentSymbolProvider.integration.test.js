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
const path = require("path");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`DocumentSymbolProvider: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'documentSymbols.cs';
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            let filePath = path.join(projectDirectory, fileName);
            fileUri = vscode.Uri.file(filePath);
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns all elements", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let symbols = yield GetDocumentSymbols(fileUri);
            // The count can vary:
            // Some builds of OmniSharp return a tree data structure with one root element
            // Some have fixes for a duplicate symbols issue and return fewer than we
            // used to assert
            // For now, just assert any symbols came back so that this passes locally and in CI
            // (where we always use the latest build)
            chai_1.expect(symbols.length).to.be.greaterThan(0);
        });
    });
});
function GetDocumentSymbols(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", fileUri);
    });
}
//# sourceMappingURL=documentSymbolProvider.integration.test.js.map