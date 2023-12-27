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
suite(`SignatureHelp: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            let fileName = 'sigHelp.cs';
            let dir = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            let loc = path.join(dir, fileName);
            fileUri = vscode.Uri.file(loc);
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Returns response with documentation as undefined when method does not have documentation", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(19, 23));
            chai_1.expect(c.signatures[0].documentation).to.be.undefined;
        });
    });
    test("Returns label when method does not have documentation", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(19, 23));
            chai_1.expect(c.signatures[0].label).to.equal(`void sigHelp.noDocMethod()`);
        });
    });
    test("Returns summary as documentation for the method", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 18));
            chai_1.expect(c.signatures[0].documentation).to.equal(`DoWork is some method.`);
        });
    });
    test("Returns label for the method", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 18));
            chai_1.expect(c.signatures[0].label).to.equal(`void sigHelp.DoWork(int Int1, float Float1, double Double1)`);
        });
    });
    test("Returns label for the parameters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 18));
            chai_1.expect(c.signatures[0].parameters[0].label).to.equal(`int Int1`);
            chai_1.expect(c.signatures[0].parameters[1].label).to.equal(`float Float1`);
        });
    });
    test("Returns documentation for the parameters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 18));
            chai_1.expect(c.signatures[0].parameters[0].documentation.value).to.equal(`**Int1**: Used to indicate status.`);
            chai_1.expect(c.signatures[0].parameters[1].documentation.value).to.equal(`**Float1**: Used to specify context.`);
        });
    });
    test("Signature Help identifies active parameter if there is no comma", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 18));
            chai_1.expect(c.signatures[0].parameters[c.activeParameter].label).to.equal(`int Int1`);
        });
    });
    test("Signature Help identifies active parameter based on comma", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 20));
            chai_1.expect(c.signatures[0].parameters[c.activeParameter].label).to.equal(`float Float1`);
        });
    });
    test("Signature Help identifies active parameter based on comma for multiple commas", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield GetSignatureHelp(fileUri, new vscode.Position(18, 27));
            chai_1.expect(c.signatures[0].parameters[c.activeParameter].label).to.equal(`double Double1`);
        });
    });
});
function GetSignatureHelp(fileUri, position) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, position);
    });
}
//# sourceMappingURL=signatureHelp.integration.test.js.map