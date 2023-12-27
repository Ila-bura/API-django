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
suite(`WorkspaceSymbolProvider: ${testAssetWorkspace_1.default.description}`, function () {
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let projectDirectory = vscode.Uri.file(testAssetWorkspace_1.default.projects[0].projectDirectoryPath);
            yield vscode.commands.executeCommand("vscode.open", projectDirectory);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns elements", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let symbols = yield GetWorkspaceSymbols("P");
            chai_1.expect(symbols.length).to.be.greaterThan(0);
        });
    });
    test("Returns no elements when minimum filter length is configured and search term is shorter", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let omnisharpConfig = vscode.workspace.getConfiguration('omnisharp');
            yield omnisharpConfig.update('minFindSymbolsFilterLength', 2);
            let symbols = yield GetWorkspaceSymbols("P");
            chai_1.expect(symbols.length).to.be.equal(0);
        });
    });
    test("Returns elements when minimum filter length is configured and search term is longer or equal", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let omnisharpConfig = vscode.workspace.getConfiguration('omnisharp');
            yield omnisharpConfig.update('minFindSymbolsFilterLength', 2);
            let symbols = yield GetWorkspaceSymbols("P1");
            chai_1.expect(symbols.length).to.be.greaterThan(0);
        });
    });
});
function GetWorkspaceSymbols(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider", filter);
    });
}
//# sourceMappingURL=workspaceSymbolProvider.integration.test.js.map