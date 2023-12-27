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
const definitionProvider_1 = require("../../src/features/definitionProvider");
const path = require("path");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
suite(`${definitionProvider_1.default.name}: ${testAssetWorkspace_1.default.description}`, () => {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'definition.cs';
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            fileUri = vscode.Uri.file(path.join(projectDirectory, fileName));
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns the definition", () => __awaiter(void 0, void 0, void 0, function* () {
        let definitionList = (yield vscode.commands.executeCommand("vscode.executeDefinitionProvider", fileUri, new vscode.Position(10, 31)));
        chai_1.expect(definitionList.length).to.be.equal(1);
        chai_1.expect(definitionList[0]).to.exist;
        chai_1.expect(definitionList[0].uri.path).to.contain("definition.cs");
    }));
    // Skipping due to https://github.com/OmniSharp/omnisharp-vscode/issues/3458
    test.skip("Returns the definition from Metadata", () => __awaiter(void 0, void 0, void 0, function* () {
        let definitionList = (yield vscode.commands.executeCommand("vscode.executeDefinitionProvider", fileUri, new vscode.Position(10, 25)));
        chai_1.expect(definitionList.length).to.be.equal(1);
        chai_1.expect(definitionList[0]).to.exist;
        chai_1.expect(definitionList[0].uri.path).to.contain("[metadata] Console.cs");
    }));
});
//# sourceMappingURL=definitionProvider.test.js.map