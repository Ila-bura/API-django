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
exports.dotnetRestore = void 0;
const serverUtils = require("../omnisharp/utils");
const launcher_1 = require("../omnisharp/launcher");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const protocol = require("../omnisharp/protocol");
const vscode = require("vscode");
const assets_1 = require("../assets");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const CompositeDisposable_1 = require("../CompositeDisposable");
const reportIssue_1 = require("./reportIssue");
const getDotnetInfo_1 = require("../utils/getDotnetInfo");
const decompilationPrompt_1 = require("../omnisharp/decompilationPrompt");
function registerCommands(context, server, platformInfo, eventStream, optionProvider, monoResolver, packageJSON, extensionPath) {
    let disposable = new CompositeDisposable_1.default();
    disposable.add(vscode.commands.registerCommand('o.restart', () => __awaiter(this, void 0, void 0, function* () { return restartOmniSharp(context, server, optionProvider); })));
    disposable.add(vscode.commands.registerCommand('o.pickProjectAndStart', () => __awaiter(this, void 0, void 0, function* () { return pickProjectAndStart(server, optionProvider); })));
    disposable.add(vscode.commands.registerCommand('o.showOutput', () => eventStream.post(new loggingEvents_1.ShowOmniSharpChannel())));
    disposable.add(vscode.commands.registerCommand('dotnet.restore.project', () => __awaiter(this, void 0, void 0, function* () { return pickProjectAndDotnetRestore(server, eventStream); })));
    disposable.add(vscode.commands.registerCommand('dotnet.restore.all', () => __awaiter(this, void 0, void 0, function* () { return dotnetRestoreAllProjects(server, eventStream); })));
    disposable.add(vscode.commands.registerCommand('o.reanalyze.allProjects', () => __awaiter(this, void 0, void 0, function* () { return reAnalyzeAllProjects(server, eventStream); })));
    disposable.add(vscode.commands.registerCommand('o.reanalyze.currentProject', () => __awaiter(this, void 0, void 0, function* () { return reAnalyzeCurrentProject(server, eventStream); })));
    // register empty handler for csharp.installDebugger
    // running the command activates the extension, which is all we need for installation to kickoff
    disposable.add(vscode.commands.registerCommand('csharp.downloadDebugger', () => { }));
    // register process picker for attach for legacy configurations.
    disposable.add(vscode.commands.registerCommand('csharp.listProcess', () => ""));
    disposable.add(vscode.commands.registerCommand('csharp.listRemoteProcess', () => ""));
    // Register command for generating tasks.json and launch.json assets.
    disposable.add(vscode.commands.registerCommand('dotnet.generateAssets', (selectedIndex) => __awaiter(this, void 0, void 0, function* () { return assets_1.generateAssets(server, selectedIndex); })));
    disposable.add(vscode.commands.registerCommand('csharp.reportIssue', () => __awaiter(this, void 0, void 0, function* () { return reportIssue_1.default(vscode, eventStream, getDotnetInfo_1.getDotnetInfo, platformInfo.isValidPlatformForMono(), optionProvider.GetLatestOptions(), monoResolver); })));
    disposable.add(vscode.commands.registerCommand('csharp.showDecompilationTerms', () => __awaiter(this, void 0, void 0, function* () { return showDecompilationTerms(context, server, optionProvider); })));
    return new CompositeDisposable_1.default(disposable);
}
exports.default = registerCommands;
function showDecompilationTerms(context, server, optionProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // Reset the decompilation authorization so the user will be prompted on restart.
        context.workspaceState.update("decompilationAuthorized", undefined);
        yield restartOmniSharp(context, server, optionProvider);
    });
}
function restartOmniSharp(context, server, optionProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // Update decompilation authorization for this workspace.
        server.decompilationAuthorized = yield decompilationPrompt_1.getDecompilationAuthorization(context, optionProvider);
        if (server.isRunning()) {
            server.restart();
        }
        else {
            server.autoStart('');
        }
    });
}
function pickProjectAndStart(server, optionProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = optionProvider.GetLatestOptions();
        return launcher_1.findLaunchTargets(options).then(targets => {
            let currentPath = server.getSolutionPathOrFolder();
            if (currentPath) {
                for (let target of targets) {
                    if (target.target === currentPath) {
                        target.label = `\u2713 ${target.label}`;
                    }
                }
            }
            return vscode.window.showQuickPick(targets, {
                matchOnDescription: true,
                placeHolder: `Select 1 of ${targets.length} projects`
            }).then((launchTarget) => __awaiter(this, void 0, void 0, function* () {
                if (launchTarget) {
                    return server.restart(launchTarget);
                }
            }));
        });
    });
}
function projectsToCommands(projects, eventStream) {
    return projects.map((project) => __awaiter(this, void 0, void 0, function* () {
        let projectDirectory = project.Directory;
        return new Promise((resolve, reject) => {
            fs.lstat(projectDirectory, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                if (stats.isFile()) {
                    projectDirectory = path.dirname(projectDirectory);
                }
                resolve({
                    label: `dotnet restore - (${project.Name || path.basename(project.Directory)})`,
                    description: projectDirectory,
                    execute() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return dotnetRestore(projectDirectory, eventStream, project.Name);
                        });
                    }
                });
            });
        });
    }));
}
function pickProjectAndDotnetRestore(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let descriptors = yield getProjectDescriptors(server);
        eventStream.post(new loggingEvents_1.CommandDotNetRestoreStart());
        let commands = yield Promise.all(projectsToCommands(descriptors, eventStream));
        let command = yield vscode.window.showQuickPick(commands);
        if (command) {
            return command.execute();
        }
    });
}
function reAnalyzeAllProjects(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        yield serverUtils.reAnalyze(server, {});
    });
}
function reAnalyzeCurrentProject(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        yield serverUtils.reAnalyze(server, {
            fileName: vscode.window.activeTextEditor.document.uri.fsPath
        });
    });
}
function dotnetRestoreAllProjects(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let descriptors = yield getProjectDescriptors(server);
        eventStream.post(new loggingEvents_1.CommandDotNetRestoreStart());
        for (let descriptor of descriptors) {
            yield dotnetRestore(descriptor.Directory, eventStream, descriptor.Name);
        }
    });
}
function getProjectDescriptors(server) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!server.isRunning()) {
            return Promise.reject('OmniSharp server is not running.');
        }
        let info = yield serverUtils.requestWorkspaceInformation(server);
        let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
        if (descriptors.length === 0) {
            return Promise.reject("No .NET Core projects found");
        }
        return descriptors;
    });
}
function dotnetRestore(cwd, eventStream, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let cmd = 'dotnet';
            let args = ['restore'];
            if (filePath) {
                args.push(filePath);
            }
            let dotnet = cp.spawn(cmd, args, { cwd: cwd, env: process.env });
            function handleData(stream) {
                stream.on('data', chunk => {
                    eventStream.post(new loggingEvents_1.CommandDotNetRestoreProgress(chunk.toString()));
                });
                stream.on('err', err => {
                    eventStream.post(new loggingEvents_1.CommandDotNetRestoreProgress(`ERROR: ${err}`));
                });
            }
            handleData(dotnet.stdout);
            handleData(dotnet.stderr);
            dotnet.on('close', (code, signal) => {
                eventStream.post(new loggingEvents_1.CommandDotNetRestoreSucceeded(`Done: ${code}.`));
                resolve();
            });
            dotnet.on('error', err => {
                eventStream.post(new loggingEvents_1.CommandDotNetRestoreFailed(`ERROR: ${err}`));
                reject(err);
            });
        });
    });
}
exports.dotnetRestore = dotnetRestore;
//# sourceMappingURL=commands.js.map