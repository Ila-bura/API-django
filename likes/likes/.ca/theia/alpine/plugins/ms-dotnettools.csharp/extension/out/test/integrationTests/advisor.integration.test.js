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
const path = require("path");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
function setLimit(to) {
    let csharpConfig = vscode.workspace.getConfiguration('csharp');
    return csharpConfig.update('maxProjectFileCountForDiagnosticAnalysis', to);
}
suite(`Advisor ${testAssetWorkspace_1.default.description}`, function () {
    let advisor;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            let activationResult = yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            if (!activationResult) {
                throw new Error('Cannot activate extension.');
            }
            else {
                advisor = activationResult.advisor;
            }
            let fileName = 'completion.cs';
            let dir = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            let fileUri = vscode.Uri.file(path.join(dir, fileName));
            yield vscode.commands.executeCommand('vscode.open', fileUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test('Advisor.shouldValidateAll returns true when maxProjectFileCountForDiagnosticAnalysis is higher than the file count', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(1000);
        chai_1.expect(advisor.shouldValidateAll()).to.be.true;
    }));
    test('Advisor.shouldValidateFiles returns true when maxProjectFileCountForDiagnosticAnalysis is higher than the file count', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(1000);
        chai_1.expect(advisor.shouldValidateFiles()).to.be.true;
    }));
    test('Advisor.shouldValidateAll returns false when maxProjectFileCountForDiagnosticAnalysis is lower than the file count', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(1);
        chai_1.expect(advisor.shouldValidateAll()).to.be.false;
    }));
    test('Advisor.shouldValidateFiles returns true when maxProjectFileCountForDiagnosticAnalysis is lower than the file count', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(1);
        chai_1.expect(advisor.shouldValidateFiles()).to.be.true;
    }));
    test('Advisor.shouldValidateAll returns true when maxProjectFileCountForDiagnosticAnalysis is null', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(null);
        chai_1.expect(advisor.shouldValidateAll()).to.be.true;
    }));
    test('Advisor.shouldValidateFiles returns true when maxProjectFileCountForDiagnosticAnalysis is null', () => __awaiter(this, void 0, void 0, function* () {
        yield setLimit(null);
        chai_1.expect(advisor.shouldValidateFiles()).to.be.true;
    }));
});
//# sourceMappingURL=advisor.integration.test.js.map