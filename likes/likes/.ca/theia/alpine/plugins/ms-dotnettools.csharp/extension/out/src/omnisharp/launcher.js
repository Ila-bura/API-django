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
exports.launchOmniSharp = exports.resourcesToLaunchTargets = exports.findLaunchTargets = exports.disabledSchemes = exports.vsls = exports.vslsTarget = exports.LaunchTargetKind = void 0;
const child_process_1 = require("child_process");
const path = require("path");
const vscode = require("vscode");
var LaunchTargetKind;
(function (LaunchTargetKind) {
    LaunchTargetKind[LaunchTargetKind["Solution"] = 0] = "Solution";
    LaunchTargetKind[LaunchTargetKind["ProjectJson"] = 1] = "ProjectJson";
    LaunchTargetKind[LaunchTargetKind["Folder"] = 2] = "Folder";
    LaunchTargetKind[LaunchTargetKind["Csx"] = 3] = "Csx";
    LaunchTargetKind[LaunchTargetKind["Cake"] = 4] = "Cake";
    LaunchTargetKind[LaunchTargetKind["LiveShare"] = 5] = "LiveShare";
})(LaunchTargetKind = exports.LaunchTargetKind || (exports.LaunchTargetKind = {}));
exports.vslsTarget = {
    label: "VSLS",
    description: "Visual Studio Live Share",
    directory: "",
    target: "",
    kind: LaunchTargetKind.LiveShare
};
/** Live share scheme */
exports.vsls = 'vsls';
/*
 * File scheme for which OmniSharp language feature should be disabled
 */
exports.disabledSchemes = new Set([
    exports.vsls,
]);
/**
 * Returns a list of potential targets on which OmniSharp can be launched.
 * This includes `project.json` files, `*.sln` and `*.slnf` files (if any `*.csproj` files are found), and the root folder
 * (if it doesn't contain a `project.json` file, but `project.json` files exist). In addition, the root folder
 * is included if there are any `*.csproj` files present, but a `*.sln` or `*.slnf` file is not found.
 */
function findLaunchTargets(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders) {
            return Promise.resolve([]);
        }
        const projectFiles = yield vscode.workspace.findFiles(
        /*include*/ '{**/*.sln,**/*.slnf,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
        /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}', 
        /*maxResults*/ options.maxProjectResults);
        const csFiles = yield vscode.workspace.findFiles(
        /*include*/ '{**/*.cs}', 
        /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}', 
        /*maxResults*/ options.maxProjectResults);
        return resourcesToLaunchTargets(projectFiles.concat(csFiles));
    });
}
exports.findLaunchTargets = findLaunchTargets;
function resourcesToLaunchTargets(resources) {
    // The list of launch targets is calculated like so:
    //   * If there are .csproj files, .sln and .slnf files are considered as launch targets.
    //   * Any project.json file is considered a launch target.
    //   * If there is no project.json file in a workspace folder, the workspace folder as added as a launch target.
    //   * Additionally, if there are .csproj files, but no .sln or .slnf file, the root is added as a launch target.
    //
    // TODO:
    //   * It should be possible to choose a .csproj as a launch target
    //   * It should be possible to choose a .sln or .slnf file even when no .csproj files are found
    //     within the root.
    if (!Array.isArray(resources) || resources.length === 0) {
        return [];
    }
    // Since language server functionality is run on the server instance there is no need
    // to start OmniSharp on the LiveShare client.
    const localResources = resources.filter(resource => !exports.disabledSchemes.has(resource.scheme));
    if (localResources.length === 0) {
        return [exports.vslsTarget];
    }
    let workspaceFolderToUriMap = new Map();
    for (let resource of localResources) {
        let folder = vscode.workspace.getWorkspaceFolder(resource);
        if (folder) {
            let buckets;
            if (workspaceFolderToUriMap.has(folder.index)) {
                buckets = workspaceFolderToUriMap.get(folder.index);
            }
            else {
                buckets = [];
                workspaceFolderToUriMap.set(folder.index, buckets);
            }
            buckets.push(resource);
        }
    }
    let targets = [];
    workspaceFolderToUriMap.forEach((resources, folderIndex) => {
        let hasCsProjFiles = false, hasSlnFile = false, hasProjectJson = false, hasProjectJsonAtRoot = false, hasCSX = false, hasCake = false, hasCs = false;
        hasCsProjFiles = resources.some(isCSharpProject);
        let folder = vscode.workspace.workspaceFolders[folderIndex];
        let folderPath = folder.uri.fsPath;
        resources.forEach(resource => {
            // Add .sln and .slnf files if there are .csproj files
            if (hasCsProjFiles && isSolution(resource)) {
                hasSlnFile = true;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: resource.fsPath,
                    directory: path.dirname(resource.fsPath),
                    kind: LaunchTargetKind.Solution
                });
            }
            // Add project.json files
            if (isProjectJson(resource)) {
                const dirname = path.dirname(resource.fsPath);
                hasProjectJson = true;
                hasProjectJsonAtRoot = hasProjectJsonAtRoot || dirname === folderPath;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: dirname,
                    directory: dirname,
                    kind: LaunchTargetKind.ProjectJson
                });
            }
            // Discover if there is any CSX file
            if (!hasCSX && isCsx(resource)) {
                hasCSX = true;
            }
            // Discover if there is any Cake file
            if (!hasCake && isCake(resource)) {
                hasCake = true;
            }
            //Discover if there is any cs file
            if (!hasCs && isCs(resource)) {
                hasCs = true;
            }
        });
        // Add the root folder under the following circumstances:
        // * If there are .csproj files, but no .sln or .slnf file, and none in the root.
        // * If there are project.json files, but none in the root.
        if ((hasCsProjFiles && !hasSlnFile) || (hasProjectJson && !hasProjectJsonAtRoot)) {
            targets.push({
                label: path.basename(folderPath),
                description: '',
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Folder
            });
        }
        // if we noticed any CSX file(s), add a single CSX-specific target pointing at the root folder
        if (hasCSX) {
            targets.push({
                label: "CSX",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Csx
            });
        }
        // if we noticed any Cake file(s), add a single Cake-specific target pointing at the root folder
        if (hasCake) {
            targets.push({
                label: "Cake",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Cake
            });
        }
        if (hasCs && !hasSlnFile && !hasCsProjFiles && !hasProjectJson && !hasProjectJsonAtRoot) {
            targets.push({
                label: path.basename(folderPath),
                description: '',
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Folder
            });
        }
    });
    return targets.sort((a, b) => a.directory.localeCompare(b.directory));
}
exports.resourcesToLaunchTargets = resourcesToLaunchTargets;
function isCSharpProject(resource) {
    return /\.csproj$/i.test(resource.fsPath);
}
function isSolution(resource) {
    return /\.slnf?$/i.test(resource.fsPath);
}
function isProjectJson(resource) {
    return /\project.json$/i.test(resource.fsPath);
}
function isCsx(resource) {
    return /\.csx$/i.test(resource.fsPath);
}
function isCake(resource) {
    return /\.cake$/i.test(resource.fsPath);
}
function isCs(resource) {
    return /\.cs$/i.test(resource.fsPath);
}
function launchOmniSharp(cwd, args, launchInfo, platformInfo, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            launch(cwd, args, launchInfo, platformInfo, options, monoResolver)
                .then(result => {
                // async error - when target not not ENEOT
                result.process.on('error', err => {
                    reject(err);
                });
                // success after a short freeing event loop
                setTimeout(function () {
                    resolve(result);
                }, 0);
            })
                .catch(reason => reject(reason));
        });
    });
}
exports.launchOmniSharp = launchOmniSharp;
function launch(cwd, args, launchInfo, platformInfo, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.useEditorFormattingSettings) {
            let globalConfig = vscode.workspace.getConfiguration('', null);
            let csharpConfig = vscode.workspace.getConfiguration('[csharp]', null);
            args.push(`formattingOptions:useTabs=${!getConfigurationValue(globalConfig, csharpConfig, 'editor.insertSpaces', true)}`);
            args.push(`formattingOptions:tabSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
            args.push(`formattingOptions:indentationSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
        }
        if (platformInfo.isWindows()) {
            return launchWindows(launchInfo.LaunchPath, cwd, args);
        }
        let monoInfo = yield monoResolver.getGlobalMonoInfo(options);
        if (monoInfo) {
            const launchPath = launchInfo.MonoLaunchPath || launchInfo.LaunchPath;
            let childEnv = monoInfo.env;
            return Object.assign(Object.assign({}, launchNixMono(launchPath, cwd, args, childEnv, options.waitForDebugger)), { monoVersion: monoInfo.version, monoPath: monoInfo.path });
        }
        else {
            return launchNix(launchInfo.LaunchPath, cwd, args);
        }
    });
}
function getConfigurationValue(globalConfig, csharpConfig, configurationPath, defaultValue) {
    if (csharpConfig[configurationPath] != undefined) {
        return csharpConfig[configurationPath];
    }
    return globalConfig.get(configurationPath, defaultValue);
}
function launchWindows(launchPath, cwd, args) {
    function escapeIfNeeded(arg) {
        const hasSpaceWithoutQuotes = /^[^"].* .*[^"]/;
        return hasSpaceWithoutQuotes.test(arg)
            ? `"${arg}"`
            : arg.replace("&", "^&");
    }
    let argsCopy = args.slice(0); // create copy of args
    argsCopy.unshift(launchPath);
    argsCopy = [[
            '/s',
            '/c',
            '"' + argsCopy.map(escapeIfNeeded).join(' ') + '"'
        ].join(' ')];
    let process = child_process_1.spawn('cmd', argsCopy, {
        windowsVerbatimArguments: true,
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath,
    };
}
function launchNix(launchPath, cwd, args) {
    let process = child_process_1.spawn(launchPath, args, {
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath
    };
}
function launchNixMono(launchPath, cwd, args, environment, useDebugger) {
    let argsCopy = args.slice(0); // create copy of details args
    argsCopy.unshift(launchPath);
    argsCopy.unshift("--assembly-loader=strict");
    if (useDebugger) {
        argsCopy.unshift("--debug");
        argsCopy.unshift("--debugger-agent=transport=dt_socket,server=y,address=127.0.0.1:55555");
    }
    let process = child_process_1.spawn('mono', argsCopy, {
        detached: false,
        cwd: cwd,
        env: environment
    });
    return {
        process,
        command: launchPath
    };
}
//# sourceMappingURL=launcher.js.map