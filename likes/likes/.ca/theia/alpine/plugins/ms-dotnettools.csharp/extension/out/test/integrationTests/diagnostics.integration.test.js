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
const poll_1 = require("./poll");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
function setDiagnosticWorkspaceLimit(to) {
    let csharpConfig = vscode.workspace.getConfiguration('csharp');
    return csharpConfig.update('maxProjectFileCountForDiagnosticAnalysis', to);
}
suite(`DiagnosticProvider: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    let secondaryFileUri;
    let razorFileUri;
    let virtualRazorFileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'diagnostics.cs';
            let secondaryFileName = 'secondaryDiagnostics.cs';
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            fileUri = vscode.Uri.file(path.join(projectDirectory, fileName));
            secondaryFileUri = vscode.Uri.file(path.join(projectDirectory, secondaryFileName));
            razorFileUri = vscode.Uri.file(path.join(projectDirectory, 'Pages', 'ErrorHaver.razor'));
            virtualRazorFileUri = vscode.Uri.file(razorFileUri.fsPath + '__virtual.cs');
        });
    });
    suite("razor workspace", () => {
        suiteSetup(function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.should();
                // These tests only run on the BasicRazorApp2_1 solution
                if (!integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                    this.skip();
                }
                yield integrationHelpers_1.activateCSharpExtension();
                yield testAssetWorkspace_1.default.restore();
                yield vscode.commands.executeCommand("vscode.open", razorFileUri);
            });
        });
        test("Razor shouldn't give diagnostics for virtual files", () => __awaiter(this, void 0, void 0, function* () {
            yield poll_1.pollDoesNotHappen(() => vscode.languages.getDiagnostics(), 5 * 1000, 500, function (res) {
                const virtual = res.find(r => r[0].fsPath === virtualRazorFileUri.fsPath);
                if (!virtual) {
                    return false;
                }
                const diagnosticsList = virtual[1];
                if (diagnosticsList.some(diag => diag.code == 'CS0103')) {
                    return true;
                }
                else {
                    return false;
                }
            });
        }));
        suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
            yield testAssetWorkspace_1.default.cleanupWorkspace();
        }));
    });
    suite("small workspace (based on maxProjectFileCountForDiagnosticAnalysis setting)", () => {
        suiteSetup(function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.should();
                // These tests don't run on the BasicRazorApp2_1 solution
                if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                    this.skip();
                }
                yield integrationHelpers_1.activateCSharpExtension();
                yield testAssetWorkspace_1.default.restore();
                yield vscode.commands.executeCommand("vscode.open", fileUri);
            });
        });
        test("Returns any diagnostics from file", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield poll_1.assertWithPoll(() => vscode.languages.getDiagnostics(fileUri), 
                /*duration*/ 10 * 1000, 
                /*step*/ 500, res => chai_1.expect(res.length).to.be.greaterThan(0));
            });
        });
        test("Return unnecessary tag in case of unused variable", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield poll_1.poll(() => vscode.languages.getDiagnostics(fileUri), 
                /*duration*/ 15 * 1000, 
                /*step*/ 500, result => result.find(x => x.code === "CS0219") != undefined);
                let cs0219 = result.find(x => x.code === "CS0219");
                chai_1.expect(cs0219).to.not.be.undefined;
                chai_1.expect(cs0219.tags).to.include(vscode.DiagnosticTag.Unnecessary);
            });
        });
        test("Return unnecessary tag in case of unnesessary using", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield poll_1.poll(() => vscode.languages.getDiagnostics(fileUri), 
                /*duration*/ 15 * 1000, 
                /*step*/ 500, result => result.find(x => x.code === "CS8019") != undefined);
                let cs8019 = result.find(x => x.code === "CS8019");
                chai_1.expect(cs8019).to.not.be.undefined;
                chai_1.expect(cs8019.tags).to.include(vscode.DiagnosticTag.Unnecessary);
            });
        });
        test("Return fadeout diagnostics like unused variables based on roslyn analyzers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield poll_1.poll(() => vscode.languages.getDiagnostics(fileUri), 
                /*duration*/ 20 * 1000, 
                /*step*/ 500, result => result.find(x => x.code === "IDE0059") != undefined);
                let ide0059 = result.find(x => x.code === "IDE0059");
                chai_1.expect(ide0059).to.not.be.undefined;
                chai_1.expect(ide0059.tags).to.include(vscode.DiagnosticTag.Unnecessary);
            });
        });
        test("On small workspaces also show/fetch closed document analysis results", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield poll_1.assertWithPoll(() => vscode.languages.getDiagnostics(secondaryFileUri), 15 * 1000, 500, res => chai_1.expect(res.length).to.be.greaterThan(0));
            });
        });
        suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
            yield testAssetWorkspace_1.default.cleanupWorkspace();
        }));
    });
    suite("large workspace (based on maxProjectFileCountForDiagnosticAnalysis setting)", () => {
        suiteSetup(function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.should();
                // These tests don't run on the BasicRazorApp2_1 solution
                if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                    this.skip();
                }
                yield setDiagnosticWorkspaceLimit(1);
                yield testAssetWorkspace_1.default.restore();
                yield integrationHelpers_1.activateCSharpExtension();
                yield integrationHelpers_1.restartOmniSharpServer();
            });
        });
        test("When workspace is count as 'large', then only show/fetch diagnostics from open documents", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // We are not opening the secondary file so there should be no diagnostics reported for it.
                yield vscode.commands.executeCommand("vscode.open", fileUri);
                yield poll_1.assertWithPoll(() => vscode.languages.getDiagnostics(fileUri), 10 * 1000, 500, openFileDiag => chai_1.expect(openFileDiag.length).to.be.greaterThan(0));
                yield poll_1.assertWithPoll(() => vscode.languages.getDiagnostics(secondaryFileUri), 10 * 1000, 500, secondaryDiag => chai_1.expect(secondaryDiag.length).to.be.eq(0));
            });
        });
        suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
            yield testAssetWorkspace_1.default.cleanupWorkspace();
        }));
    });
});
//# sourceMappingURL=diagnostics.integration.test.js.map