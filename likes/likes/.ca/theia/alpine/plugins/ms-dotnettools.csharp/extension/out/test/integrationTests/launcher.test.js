"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const chai_1 = require("chai");
const launcher_1 = require("../../src/omnisharp/launcher");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`launcher:`, () => {
    test(`Returns the LiveShare launch target when processing vsls resources`, () => {
        const testResources = [
            vscode.Uri.parse(`${launcher_1.vsls}:/test.sln`),
            vscode.Uri.parse(`${launcher_1.vsls}:/test/test.csproj`),
            vscode.Uri.parse(`${launcher_1.vsls}:/test/Program.cs`),
        ];
        const launchTargets = launcher_1.resourcesToLaunchTargets(testResources);
        const liveShareTarget = launchTargets.find(target => target === launcher_1.vslsTarget);
        chai_1.assert.exists(liveShareTarget, "Launch targets was not the Visual Studio Live Share target.");
    });
    test(`Does not return the LiveShare launch target when processing local resources`, () => {
        const testResources = [
            vscode.Uri.parse(`/test.sln`),
            vscode.Uri.parse(`/test/test.csproj`),
            vscode.Uri.parse(`/test/Program.cs`),
        ];
        const launchTargets = launcher_1.resourcesToLaunchTargets(testResources);
        const liveShareTarget = launchTargets.find(target => target === launcher_1.vslsTarget);
        chai_1.assert.notExists(liveShareTarget, "Launch targets contained the Visual Studio Live Share target.");
    });
});
//# sourceMappingURL=launcher.test.js.map