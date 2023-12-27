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
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
const LanguageMiddlewareFeature_1 = require("../../src/omnisharp/LanguageMiddlewareFeature");
suite(`${LanguageMiddlewareFeature_1.LanguageMiddlewareFeature.name}: ${testAssetWorkspace_1.default.description}`, () => {
    let fileUri;
    let remappedFileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield registerLanguageMiddleware();
            yield testAssetWorkspace_1.default.restore();
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            let remappedFileName = 'remapped.txt';
            remappedFileUri = vscode.Uri.file(path.join(projectDirectory, remappedFileName));
            let fileName = 'remap.cs';
            fileUri = vscode.Uri.file(path.join(projectDirectory, fileName));
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns the remapped workspaceEdit", () => __awaiter(void 0, void 0, void 0, function* () {
        // Avoid flakiness with renames.
        yield new Promise(r => setTimeout(r, 2000));
        let workspaceEdit = (yield vscode.commands.executeCommand("vscode.executeDocumentRenameProvider", fileUri, new vscode.Position(4, 30), 'newName'));
        let entries = workspaceEdit.entries();
        chai_1.expect(entries.length).to.be.equal(1);
        chai_1.expect(entries[0][0].path).to.be.equal(remappedFileUri.path);
    }));
    test("Returns the remapped references", () => __awaiter(void 0, void 0, void 0, function* () {
        let references = (yield vscode.commands.executeCommand("vscode.executeReferenceProvider", fileUri, new vscode.Position(4, 30)));
        chai_1.expect(references.length).to.be.equal(1);
        chai_1.expect(references[0].uri.path).to.be.equal(remappedFileUri.path);
    }));
    test("Returns the remapped definition", () => __awaiter(void 0, void 0, void 0, function* () {
        let definitions = (yield vscode.commands.executeCommand("vscode.executeDefinitionProvider", fileUri, new vscode.Position(4, 30)));
        chai_1.expect(definitions.length).to.be.equal(1);
        chai_1.expect(definitions[0].uri.path).to.be.equal(remappedFileUri.path);
    }));
    test("Returns the remapped implementations", () => __awaiter(void 0, void 0, void 0, function* () {
        let implementations = (yield vscode.commands.executeCommand("vscode.executeImplementationProvider", fileUri, new vscode.Position(4, 30)));
        chai_1.expect(implementations.length).to.be.equal(1);
        chai_1.expect(implementations[0].uri.path).to.be.equal(remappedFileUri.path);
    }));
});
function registerLanguageMiddleware() {
    return __awaiter(this, void 0, void 0, function* () {
        const middleware = new TestLanguageMiddleware();
        yield vscode.commands.executeCommand('omnisharp.registerLanguageMiddleware', middleware);
    });
}
class TestLanguageMiddleware {
    constructor() {
        this.language = 'MyLang';
        let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
        let remappedFileName = 'remapped.txt';
        this.remappedFileUri = vscode.Uri.file(path.join(projectDirectory, remappedFileName));
        let fileToRemap = 'remap.cs';
        this.fileToRemapUri = vscode.Uri.file(path.join(projectDirectory, fileToRemap));
    }
    remapWorkspaceEdit(workspaceEdit, token) {
        const newEdit = new vscode.WorkspaceEdit();
        for (const entry of workspaceEdit.entries()) {
            const uri = entry[0];
            const edits = entry[1];
            if (uri.path === this.fileToRemapUri.path) {
                // Return a naive edit in the remapped file.
                newEdit.set(this.remappedFileUri, [new vscode.TextEdit(new vscode.Range(0, 0, 0, 1), '')]);
            }
            else {
                newEdit.set(uri, edits);
            }
        }
        return newEdit;
    }
    remapLocations(locations, token) {
        const remapped = new Array();
        for (const location of locations) {
            if (location.uri.path === this.fileToRemapUri.path) {
                // Naively return a remapped file.
                remapped.push(new vscode.Location(this.remappedFileUri, new vscode.Position(0, 0)));
            }
            else {
                remapped.push(location);
            }
        }
        return remapped;
    }
}
//# sourceMappingURL=languageMiddleware.integration.test.js.map