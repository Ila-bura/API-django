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
const fs = require("async-file");
const vscode = require("vscode");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const poll_1 = require("./poll");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`Tasks generation: ${testAssetWorkspace_1.default.description}`, function () {
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            yield vscode.commands.executeCommand("dotnet.generateAssets", 0);
            yield poll_1.poll(() => __awaiter(this, void 0, void 0, function* () { return yield fs.exists(testAssetWorkspace_1.default.launchJsonPath); }), 10000, 100);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("Starting .NET Core Launch (console) from the workspace root should create an Active Debug Session", () => __awaiter(this, void 0, void 0, function* () {
        const onChangeSubscription = vscode.debug.onDidChangeActiveDebugSession((e) => {
            onChangeSubscription.dispose();
            chai_1.expect(vscode.debug.activeDebugSession).not.to.be.undefined;
            chai_1.expect(vscode.debug.activeDebugSession.type).to.equal("coreclr");
        });
        let result = yield vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], ".NET Core Launch (console)");
        chai_1.expect(result, "Debugger could not be started.");
        let debugSessionTerminated = new Promise(resolve => {
            const onTerminateSubscription = vscode.debug.onDidTerminateDebugSession((e) => {
                onTerminateSubscription.dispose();
                resolve();
            });
        });
        yield debugSessionTerminated;
    }));
});
//# sourceMappingURL=launchConfiguration.integration.test.js.map