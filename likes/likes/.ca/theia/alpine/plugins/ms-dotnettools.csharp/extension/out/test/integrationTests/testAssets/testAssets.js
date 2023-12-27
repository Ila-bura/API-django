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
exports.TestAssetWorkspace = exports.TestAssetProject = void 0;
const fs = require("async-file");
const path = require("path");
const vscode = require("vscode");
const spawnGit_1 = require("./spawnGit");
class TestAssetProject {
    constructor(project) {
        this.relativeFilePath = project.relativeFilePath;
    }
    get projectDirectoryPath() {
        return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, path.dirname(this.relativeFilePath));
    }
    addFileWithContents(fileName, contents) {
        return __awaiter(this, void 0, void 0, function* () {
            let dir = this.projectDirectoryPath;
            let loc = path.join(dir, fileName);
            yield fs.writeTextFile(loc, contents);
            return vscode.Uri.file(loc);
        });
    }
}
exports.TestAssetProject = TestAssetProject;
class TestAssetWorkspace {
    constructor(workspace) {
        this.projects = workspace.projects.map(w => new TestAssetProject(w));
        this.description = workspace.description;
    }
    restore() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("dotnet.restore.all");
        });
    }
    get vsCodeDirectoryPath() {
        return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".vscode");
    }
    get launchJsonPath() {
        return path.join(this.vsCodeDirectoryPath, "launch.json");
    }
    get tasksJsonPath() {
        return path.join(this.vsCodeDirectoryPath, "tasks.json");
    }
    cleanupWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            let workspaceRootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            let cleanUpRoutine = () => __awaiter(this, void 0, void 0, function* () {
                yield vscode.commands.executeCommand("workbench.action.closeAllEditors");
                yield spawnGit_1.default(["clean", "-xdf", "."], { cwd: workspaceRootPath });
                yield spawnGit_1.default(["checkout", "--", "."], { cwd: workspaceRootPath });
            });
            let sleep = () => __awaiter(this, void 0, void 0, function* () { return new Promise((resolve) => setTimeout(resolve, 2 * 1000)); });
            try {
                yield cleanUpRoutine();
            }
            catch (error) {
                // Its possible that cleanup fails for locked files etc, for this reason retry is added.
                yield sleep();
                yield cleanUpRoutine();
            }
        });
    }
}
exports.TestAssetWorkspace = TestAssetWorkspace;
//# sourceMappingURL=testAssets.js.map