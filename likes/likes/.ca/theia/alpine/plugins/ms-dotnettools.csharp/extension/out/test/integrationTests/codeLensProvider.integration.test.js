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
suite(`CodeLensProvider: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'Program.cs';
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            let filePath = path.join(projectDirectory, fileName);
            fileUri = vscode.Uri.file(filePath);
            let csharpConfig = vscode.workspace.getConfiguration('csharp');
            yield csharpConfig.update('referencesCodeLens.enabled', true);
            yield csharpConfig.update('testsCodeLens.enabled', true);
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns all code lenses", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let codeLenses = yield GetCodeLenses(fileUri);
            chai_1.expect(codeLenses.length).to.equal(2);
            for (let codeLens of codeLenses) {
                chai_1.expect(codeLens.isResolved).to.be.false;
                chai_1.expect(codeLens.command).to.be.undefined;
            }
        });
    });
    test("Returns all resolved code lenses", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let codeLenses = yield GetCodeLenses(fileUri, 100);
            chai_1.expect(codeLenses.length).to.equal(2);
            for (let codeLens of codeLenses) {
                chai_1.expect(codeLens.isResolved).to.be.true;
                chai_1.expect(codeLens.command).not.to.be.undefined;
                chai_1.expect(codeLens.command.title).to.equal("0 references");
            }
        });
    });
});
suite(`CodeLensProvider options: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            // These tests only run on the slnWithCsproj solution
            if (vscode.workspace.workspaceFolders[0].uri.fsPath.split(path.sep).pop() !== 'slnWithCsproj') {
                this.skip();
            }
            else {
                yield integrationHelpers_1.activateCSharpExtension();
                yield testAssetWorkspace_1.default.restore();
                let fileName = 'UnitTest1.cs';
                let projectDirectory = testAssetWorkspace_1.default.projects[2].projectDirectoryPath;
                let filePath = path.join(projectDirectory, fileName);
                fileUri = vscode.Uri.file(filePath);
                yield vscode.commands.executeCommand("vscode.open", fileUri);
            }
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    /* Skip this test until we are able to understand the cause of flakiness */
    test.skip("Returns no references code lenses when 'csharp.referencesCodeLens.enabled' option is set to false", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let csharpConfig = vscode.workspace.getConfiguration('csharp');
            yield csharpConfig.update('referencesCodeLens.enabled', false);
            yield csharpConfig.update('testsCodeLens.enabled', true);
            let codeLenses = yield GetCodeLenses(fileUri, 100);
            chai_1.expect(codeLenses.length).to.equal(4);
            for (let codeLens of codeLenses) {
                chai_1.expect(codeLens.isResolved).to.be.true;
                chai_1.expect(codeLens.command).not.to.be.undefined;
                chai_1.expect(codeLens.command.command).to.be.oneOf(['dotnet.test.run', 'dotnet.classTests.run', 'dotnet.test.debug', 'dotnet.classTests.debug']);
                chai_1.expect(codeLens.command.title).to.be.oneOf(['Run Test', 'Run All Tests', 'Debug Test', 'Debug All Tests']);
            }
        });
    });
    test("Returns no test code lenses when 'csharp.testsCodeLens.enabled' option is set to false", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let csharpConfig = vscode.workspace.getConfiguration('csharp');
            yield csharpConfig.update('referencesCodeLens.enabled', true);
            yield csharpConfig.update('testsCodeLens.enabled', false);
            let codeLenses = yield GetCodeLenses(fileUri, 100);
            chai_1.expect(codeLenses.length).to.equal(2);
            for (let codeLens of codeLenses) {
                chai_1.expect(codeLens.isResolved).to.be.true;
                chai_1.expect(codeLens.command).not.to.be.undefined;
                chai_1.expect(codeLens.command.command).to.be.equal('editor.action.showReferences');
                chai_1.expect(codeLens.command.title).to.equal('0 references');
            }
        });
    });
    test("Returns no code lenses when 'csharp.referencesCodeLens.enabled' and 'csharp.testsCodeLens.enabled' options are set to false", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let csharpConfig = vscode.workspace.getConfiguration('csharp');
            yield csharpConfig.update('referencesCodeLens.enabled', false);
            yield csharpConfig.update('testsCodeLens.enabled', false);
            let codeLenses = yield GetCodeLenses(fileUri, 100);
            chai_1.expect(codeLenses.length).to.equal(0);
        });
    });
});
function GetCodeLenses(fileUri, resolvedItemCount) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode.commands.executeCommand("vscode.executeCodeLensProvider", fileUri, resolvedItemCount);
    });
}
//# sourceMappingURL=codeLensProvider.integration.test.js.map