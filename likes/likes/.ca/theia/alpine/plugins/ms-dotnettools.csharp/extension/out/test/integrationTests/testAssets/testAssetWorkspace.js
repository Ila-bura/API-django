"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const testAssets_1 = require("./testAssets");
const singleCsproj_1 = require("./singleCsproj");
const slnWithCsproj_1 = require("./slnWithCsproj");
const slnFilterWithCsproj_1 = require("./slnFilterWithCsproj");
const BasicRazorApp2_1_1 = require("./BasicRazorApp2_1");
const testAssetWorkspaces = {
    singleCsproj: singleCsproj_1.default,
    slnWithCsproj: slnWithCsproj_1.default,
    slnFilterWithCsproj: slnFilterWithCsproj_1.default,
    BasicRazorApp2_1: BasicRazorApp2_1_1.default
};
const workspaceName = vscode.workspace.workspaceFolders[0].uri.fsPath
    .split(path.sep)
    .pop();
const activeTestAssetWorkspace = new testAssets_1.TestAssetWorkspace(testAssetWorkspaces[workspaceName]);
exports.default = activeTestAssetWorkspace;
//# sourceMappingURL=testAssetWorkspace.js.map