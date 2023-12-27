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
exports.updateJsonWithComments = exports.replaceCommentPropertiesWithComments = exports.generateAssets = exports.addAssetsIfNecessary = exports.AddAssetResult = exports.addTasksJsonIfNecessary = exports.getFormattingOptions = exports.getBuildOperations = exports.createAttachConfiguration = exports.createFallbackLaunchConfiguration = exports.createLaunchConfiguration = exports.createBlazorWebAssemblyStandaloneLaunchConfiguration = exports.createBlazorWebAssemblyHostedLaunchConfiguration = exports.createWebLaunchConfiguration = exports.ProgramLaunchType = exports.AssetGenerator = void 0;
const fs = require("fs-extra");
const jsonc = require("jsonc-parser");
const os = require("os");
const path = require("path");
const protocol = require("./omnisharp/protocol");
const serverUtils = require("./omnisharp/utils");
const util = require("./common");
const vscode = require("vscode");
const json_1 = require("./json");
class AssetGenerator {
    constructor(workspaceInfo, workspaceFolder = undefined) {
        if (workspaceFolder) {
            this.workspaceFolder = workspaceFolder;
        }
        else {
            let resourcePath = undefined;
            if (!resourcePath && workspaceInfo.Cake) {
                resourcePath = workspaceInfo.Cake.Path;
            }
            if (!resourcePath && workspaceInfo.ScriptCs) {
                resourcePath = workspaceInfo.ScriptCs.Path;
            }
            if (!resourcePath && workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                resourcePath = workspaceInfo.DotNet.Projects[0].Path;
            }
            if (!resourcePath && workspaceInfo.MsBuild) {
                resourcePath = workspaceInfo.MsBuild.SolutionPath;
            }
            this.workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(resourcePath));
        }
        this.vscodeFolder = path.join(this.workspaceFolder.uri.fsPath, '.vscode');
        this.tasksJsonPath = path.join(this.vscodeFolder, 'tasks.json');
        this.launchJsonPath = path.join(this.vscodeFolder, 'launch.json');
        this.startupProject = undefined;
        this.fallbackBuildProject = undefined;
        if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects.length > 0) {
            this.executeableProjects = protocol.findExecutableMSBuildProjects(workspaceInfo.MsBuild.Projects);
            if (this.executeableProjects.length === 0) {
                this.fallbackBuildProject = workspaceInfo.MsBuild.Projects[0];
            }
        }
        else {
            this.executeableProjects = [];
        }
    }
    hasExecutableProjects() {
        return this.executeableProjects.length > 0;
    }
    isStartupProjectSelected() {
        if (this.startupProject) {
            return true;
        }
        else {
            return false;
        }
    }
    selectStartupProject(selectedIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasExecutableProjects()) {
                throw new Error("No executable projects");
            }
            if (this.executeableProjects.length === 1) {
                this.startupProject = this.executeableProjects[0];
                return true;
            }
            else {
                const mapItemNameToProject = {};
                const itemNames = [];
                this.executeableProjects.forEach(project => {
                    const itemName = `${path.basename(project.Path, ".csproj")} (${project.Path})`;
                    itemNames.push(itemName);
                    mapItemNameToProject[itemName] = project;
                });
                let selectedItem;
                if (selectedIndex != null) {
                    selectedItem = itemNames[selectedIndex];
                }
                else {
                    selectedItem = yield vscode.window.showQuickPick(itemNames, {
                        matchOnDescription: true,
                        placeHolder: "Select the project to launch"
                    });
                }
                if (!selectedItem || !mapItemNameToProject[selectedItem]) {
                    return false;
                }
                this.startupProject = mapItemNameToProject[selectedItem];
                return true;
            }
        });
    }
    // This method is used by the unit tests instead of selectStartupProject
    setStartupProject(index) {
        if (index >= this.executeableProjects.length) {
            throw new Error("Invalid project index");
        }
        this.startupProject = this.executeableProjects[index];
    }
    hasWebServerDependency() {
        if (!this.startupProject) {
            throw new Error("Startup project not set");
        }
        return this.startupProject.IsWebProject;
    }
    computeProgramLaunchType() {
        if (!this.startupProject) {
            throw new Error("Startup project not set");
        }
        if (this.startupProject.IsBlazorWebAssemblyStandalone) {
            return ProgramLaunchType.BlazorWebAssemblyStandalone;
        }
        if (this.startupProject.IsBlazorWebAssemblyHosted) {
            return ProgramLaunchType.BlazorWebAssemblyHosted;
        }
        if (this.startupProject.IsWebProject) {
            return ProgramLaunchType.Web;
        }
        return ProgramLaunchType.Console;
    }
    computeProgramPath() {
        if (!this.startupProject) {
            throw new Error("Startup project not set");
        }
        const startupProjectDir = path.dirname(this.startupProject.Path);
        const relativeProjectDir = path.join('${workspaceFolder}', path.relative(this.workspaceFolder.uri.fsPath, startupProjectDir));
        const configurationName = 'Debug';
        const targetFramework = protocol.findNetCoreTargetFramework(this.startupProject);
        const result = path.join(relativeProjectDir, `bin/${configurationName}/${targetFramework.ShortName}/${this.startupProject.AssemblyName}.dll`);
        return result;
    }
    computeWorkingDirectory() {
        if (!this.startupProject) {
            throw new Error("Startup project not set");
        }
        const startupProjectDir = path.dirname(this.startupProject.Path);
        return path.join('${workspaceFolder}', path.relative(this.workspaceFolder.uri.fsPath, startupProjectDir));
    }
    createLaunchJsonConfigurationsArray(programLaunchType) {
        const launchJson = this.createLaunchJsonConfigurations(programLaunchType);
        const configurationArray = JSON.parse(launchJson);
        // Remove comments
        configurationArray.forEach((configuration) => {
            for (const key in configuration) {
                if (Object.prototype.hasOwnProperty.call(configuration, key)) {
                    if (key.startsWith("OS-COMMENT")) {
                        delete configuration[key];
                    }
                }
            }
        });
        return configurationArray;
    }
    createLaunchJsonConfigurations(programLaunchType) {
        switch (programLaunchType) {
            case ProgramLaunchType.Console: {
                const launchConfigurationsMassaged = createLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory());
                const attachConfigurationsMassaged = createAttachConfiguration();
                return `
[
    ${launchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
            }
            case ProgramLaunchType.Web: {
                const webLaunchConfigurationsMassaged = createWebLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory());
                const attachConfigurationsMassaged = createAttachConfiguration();
                return `
[
    ${webLaunchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
            }
            case ProgramLaunchType.BlazorWebAssemblyHosted: {
                const hostedLaunchConfigMassaged = createBlazorWebAssemblyHostedLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory());
                return `
[
    ${hostedLaunchConfigMassaged}
]`;
            }
            case ProgramLaunchType.BlazorWebAssemblyStandalone: {
                const standaloneLaunchConfigMassaged = createBlazorWebAssemblyStandaloneLaunchConfiguration(this.computeWorkingDirectory());
                return `
[
    ${standaloneLaunchConfigMassaged}
]`;
            }
        }
    }
    createBuildTaskDescription() {
        let commandArgs = ['build'];
        this.AddAdditionalCommandArgs(commandArgs);
        return {
            label: 'build',
            command: 'dotnet',
            type: 'process',
            args: commandArgs,
            problemMatcher: '$msCompile'
        };
    }
    createPublishTaskDescription() {
        let commandArgs = ['publish'];
        this.AddAdditionalCommandArgs(commandArgs);
        return {
            label: 'publish',
            command: 'dotnet',
            type: 'process',
            args: commandArgs,
            problemMatcher: '$msCompile'
        };
    }
    createWatchTaskDescription() {
        let commandArgs = ['watch', 'run'];
        this.AddAdditionalCommandArgs(commandArgs);
        return {
            label: 'watch',
            command: 'dotnet',
            type: 'process',
            args: commandArgs,
            problemMatcher: '$msCompile'
        };
    }
    AddAdditionalCommandArgs(commandArgs) {
        let buildProject = this.startupProject;
        if (!buildProject) {
            buildProject = this.fallbackBuildProject;
        }
        if (buildProject) {
            const buildPath = path.join('${workspaceFolder}', path.relative(this.workspaceFolder.uri.fsPath, buildProject.Path));
            commandArgs.push(util.convertNativePathToPosix(buildPath));
        }
        commandArgs.push("/property:GenerateFullPaths=true");
        commandArgs.push("/consoleloggerparameters:NoSummary");
    }
    createTasksConfiguration() {
        return {
            version: "2.0.0",
            tasks: [this.createBuildTaskDescription(), this.createPublishTaskDescription(), this.createWatchTaskDescription()]
        };
    }
}
exports.AssetGenerator = AssetGenerator;
var ProgramLaunchType;
(function (ProgramLaunchType) {
    ProgramLaunchType[ProgramLaunchType["Console"] = 0] = "Console";
    ProgramLaunchType[ProgramLaunchType["Web"] = 1] = "Web";
    ProgramLaunchType[ProgramLaunchType["BlazorWebAssemblyHosted"] = 2] = "BlazorWebAssemblyHosted";
    ProgramLaunchType[ProgramLaunchType["BlazorWebAssemblyStandalone"] = 3] = "BlazorWebAssemblyStandalone";
})(ProgramLaunchType = exports.ProgramLaunchType || (exports.ProgramLaunchType = {}));
function createWebLaunchConfiguration(programPath, workingDirectory) {
    const configuration = {
        "OS-COMMENT1": "Use IntelliSense to find out which attributes exist for C# debugging",
        "OS-COMMENT2": "Use hover for the description of the existing attributes",
        "OS-COMMENT3": "For further information visit https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md",
        "name": ".NET Core Launch (web)",
        "type": "coreclr",
        "request": "launch",
        "preLaunchTask": "build",
        "OS-COMMENT4": "If you have changed target frameworks, make sure to update the program path.",
        "program": `${util.convertNativePathToPosix(programPath)}`,
        "args": Array(0),
        "cwd": `${util.convertNativePathToPosix(workingDirectory)}`,
        "stopAtEntry": false,
        "OS-COMMENT5": "Enable launching a web browser when ASP.NET Core starts. For more information: https://aka.ms/VSCode-CS-LaunchJson-WebBrowser",
        "serverReadyAction": {
            "action": "openExternally",
            "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
        },
        "env": {
            "ASPNETCORE_ENVIRONMENT": "Development"
        },
        "sourceFileMap": {
            "/Views": "\${workspaceFolder}/Views"
        }
    };
    return JSON.stringify(configuration);
}
exports.createWebLaunchConfiguration = createWebLaunchConfiguration;
function createBlazorWebAssemblyHostedLaunchConfiguration(programPath, workingDirectory) {
    const configuration = {
        "name": "Launch and Debug Hosted Blazor WebAssembly App",
        "type": "blazorwasm",
        "request": "launch",
        "hosted": true,
        "OS-COMMENT1": "If you have changed target frameworks, make sure to update the program path.",
        "program": `${util.convertNativePathToPosix(programPath)}`,
        "cwd": `${util.convertNativePathToPosix(workingDirectory)}`
    };
    return JSON.stringify(configuration);
}
exports.createBlazorWebAssemblyHostedLaunchConfiguration = createBlazorWebAssemblyHostedLaunchConfiguration;
function createBlazorWebAssemblyStandaloneLaunchConfiguration(workingDirectory) {
    const configuration = {
        "name": "Launch and Debug Standalone Blazor WebAssembly App",
        "type": "blazorwasm",
        "request": "launch",
        "cwd": `${util.convertNativePathToPosix(workingDirectory)}`
    };
    return JSON.stringify(configuration);
}
exports.createBlazorWebAssemblyStandaloneLaunchConfiguration = createBlazorWebAssemblyStandaloneLaunchConfiguration;
function createLaunchConfiguration(programPath, workingDirectory) {
    const configuration = {
        "OS-COMMENT1": "Use IntelliSense to find out which attributes exist for C# debugging",
        "OS-COMMENT2": "Use hover for the description of the existing attributes",
        "OS-COMMENT3": "For further information visit https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md",
        "name": ".NET Core Launch (console)",
        "type": "coreclr",
        "request": "launch",
        "preLaunchTask": "build",
        "OS-COMMENT4": "If you have changed target frameworks, make sure to update the program path.",
        "program": `${util.convertNativePathToPosix(programPath)}`,
        "args": Array(0),
        "cwd": `${util.convertNativePathToPosix(workingDirectory)}`,
        "OS-COMMENT5": "For more information about the 'console' field, see https://aka.ms/VSCode-CS-LaunchJson-Console",
        "console": "internalConsole",
        "stopAtEntry": false
    };
    return JSON.stringify(configuration);
}
exports.createLaunchConfiguration = createLaunchConfiguration;
// DebugConfiguration written to launch.json when the extension fails to generate a good configuration
function createFallbackLaunchConfiguration() {
    return {
        "name": ".NET Core Launch (console)",
        "type": "coreclr",
        "request": "launch",
        "WARNING01": "*********************************************************************************",
        "WARNING02": "The C# extension was unable to automatically decode projects in the current",
        "WARNING03": "workspace to create a runnable launch.json file. A template launch.json file has",
        "WARNING04": "been created as a placeholder.",
        "WARNING05": "",
        "WARNING06": "If OmniSharp is currently unable to load your project, you can attempt to resolve",
        "WARNING07": "this by restoring any missing project dependencies (example: run 'dotnet restore')",
        "WARNING08": "and by fixing any reported errors from building the projects in your workspace.",
        "WARNING09": "If this allows OmniSharp to now load your project then --",
        "WARNING10": "  * Delete this file",
        "WARNING11": "  * Open the Visual Studio Code command palette (View->Command Palette)",
        "WARNING12": "  * run the command: '.NET: Generate Assets for Build and Debug'.",
        "WARNING13": "",
        "WARNING14": "If your project requires a more complex launch configuration, you may wish to delete",
        "WARNING15": "this configuration and pick a different template using the 'Add Configuration...'",
        "WARNING16": "button at the bottom of this file.",
        "WARNING17": "*********************************************************************************",
        "preLaunchTask": "build",
        "program": "${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll",
        "args": [],
        "cwd": "${workspaceFolder}",
        "console": "internalConsole",
        "stopAtEntry": false
    };
}
exports.createFallbackLaunchConfiguration = createFallbackLaunchConfiguration;
// AttachConfiguration
function createAttachConfiguration() {
    const configuration = {
        "name": ".NET Core Attach",
        "type": "coreclr",
        "request": "attach"
    };
    return JSON.stringify(configuration);
}
exports.createAttachConfiguration = createAttachConfiguration;
function hasAddOperations(operations) {
    return operations.addTasksJson || operations.addLaunchJson;
}
function getOperations(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return getBuildOperations(generator).then((operations) => __awaiter(this, void 0, void 0, function* () { return getLaunchOperations(generator, operations); }));
    });
}
/**
 * Finds a build task if there is one. Only handles new format.
 */
function getBuildTasks(tasksConfiguration) {
    let result = [];
    function findBuildTask(version, tasksDescriptions) {
        let buildTask = undefined;
        if (tasksDescriptions) {
            buildTask = tasksDescriptions.find(td => td.group === 'build');
        }
        if (buildTask !== undefined) {
            result.push(buildTask);
        }
    }
    findBuildTask(tasksConfiguration.version, tasksConfiguration.tasks);
    if (tasksConfiguration.windows) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.windows.tasks);
    }
    if (tasksConfiguration.osx) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.osx.tasks);
    }
    if (tasksConfiguration.linux) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.linux.tasks);
    }
    return result;
}
function getBuildOperations(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.exists(generator.tasksJsonPath, exists => {
                if (exists) {
                    fs.readFile(generator.tasksJsonPath, (err, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        const text = buffer.toString();
                        let tasksConfiguration;
                        try {
                            tasksConfiguration = json_1.tolerantParse(text);
                        }
                        catch (error) {
                            vscode.window.showErrorMessage(`Failed to parse tasks.json file`);
                            return resolve({ updateTasksJson: false });
                        }
                        if (!tasksConfiguration.version || !tasksConfiguration.version.startsWith("2.0.")) {
                            // We don't have code to update the older tasks format, so don't try to update it
                            return resolve({ updateTasksJson: false });
                        }
                        let buildTasks = getBuildTasks(tasksConfiguration);
                        resolve({ updateTasksJson: buildTasks.length === 0 });
                    });
                }
                else {
                    resolve({ addTasksJson: true });
                }
            });
        });
    });
}
exports.getBuildOperations = getBuildOperations;
function getLaunchOperations(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!generator.hasExecutableProjects()) {
            return Promise.resolve(operations);
        }
        return new Promise((resolve, reject) => {
            return fs.exists(generator.launchJsonPath, exists => {
                if (exists) {
                    resolve(operations);
                }
                else {
                    operations.addLaunchJson = true;
                    resolve(operations);
                }
            });
        });
    });
}
var PromptResult;
(function (PromptResult) {
    PromptResult[PromptResult["Yes"] = 0] = "Yes";
    PromptResult[PromptResult["No"] = 1] = "No";
    PromptResult[PromptResult["Disable"] = 2] = "Disable";
})(PromptResult || (PromptResult = {}));
function promptToAddAssets(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const yesItem = { title: 'Yes', result: PromptResult.Yes };
            const noItem = { title: 'Not Now', result: PromptResult.No, isCloseAffordance: true };
            const disableItem = { title: "Don't Ask Again", result: PromptResult.Disable };
            const projectName = path.basename(workspaceFolder.uri.fsPath);
            if (!getBuildAssetsNotificationSetting()) {
                vscode.window.showWarningMessage(`Required assets to build and debug are missing from '${projectName}'. Add them?`, disableItem, noItem, yesItem)
                    .then(selection => { var _a; return resolve((_a = selection === null || selection === void 0 ? void 0 : selection.result) !== null && _a !== void 0 ? _a : PromptResult.No); });
            }
        });
    });
}
function getBuildAssetsNotificationSetting() {
    const newSettingName = 'suppressBuildAssetsNotification';
    let csharpConfig = vscode.workspace.getConfiguration('csharp');
    if (csharpConfig.has(newSettingName)) {
        return csharpConfig.get(newSettingName);
    }
    return csharpConfig.get('supressBuildAssetsNotification');
}
function getFormattingOptions() {
    var _a, _b;
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const tabSize = (_a = editorConfig.get('tabSize')) !== null && _a !== void 0 ? _a : 4;
    const insertSpaces = (_b = editorConfig.get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
    const filesConfig = vscode.workspace.getConfiguration('files');
    const eolSetting = filesConfig.get('eol');
    const eol = !eolSetting || eolSetting === 'auto' ? os.EOL : '\n';
    const formattingOptions = {
        insertSpaces: insertSpaces,
        tabSize: tabSize,
        eol: eol
    };
    return formattingOptions;
}
exports.getFormattingOptions = getFormattingOptions;
function addTasksJsonIfNecessary(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!operations.addTasksJson && !operations.updateTasksJson) {
                return resolve();
            }
            const formattingOptions = getFormattingOptions();
            const tasksJson = generator.createTasksConfiguration();
            let text;
            if (!fs.pathExistsSync(generator.tasksJsonPath)) {
                // when tasks.json does not exist create it and write all the content directly
                const tasksJsonText = JSON.stringify(tasksJson);
                const tasksJsonTextFormatted = jsonc.applyEdits(tasksJsonText, jsonc.format(tasksJsonText, null, formattingOptions));
                text = tasksJsonTextFormatted;
            }
            else {
                // when tasks.json exists just update the tasks node
                const ourConfigs = tasksJson.tasks;
                const content = fs.readFileSync(generator.tasksJsonPath).toString();
                const updatedJson = updateJsonWithComments(content, ourConfigs, 'tasks', 'label', formattingOptions);
                text = updatedJson;
            }
            const tasksJsonTextCommented = replaceCommentPropertiesWithComments(text);
            fs.writeFile(generator.tasksJsonPath, tasksJsonTextCommented, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
exports.addTasksJsonIfNecessary = addTasksJsonIfNecessary;
function addLaunchJsonIfNecessary(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!operations.addLaunchJson) {
                return resolve();
            }
            const programLaunchType = generator.computeProgramLaunchType();
            const launchJsonConfigurations = generator.createLaunchJsonConfigurations(programLaunchType);
            const formattingOptions = getFormattingOptions();
            let text;
            if (!fs.pathExistsSync(generator.launchJsonPath)) {
                // when launch.json does not exist, create it and write all the content directly
                const configurationsMassaged = launchJsonConfigurations;
                const launchJsonText = `
            {
                "version": "0.2.0",
                "configurations": ${configurationsMassaged}
            }`;
                text = jsonc.applyEdits(launchJsonText, jsonc.format(launchJsonText, null, formattingOptions));
            }
            else {
                // when launch.json exists replace or append our configurations
                const ourConfigs = jsonc.parse(launchJsonConfigurations);
                const content = fs.readFileSync(generator.launchJsonPath).toString();
                const updatedJson = updateJsonWithComments(content, ourConfigs, 'configurations', 'name', formattingOptions);
                text = updatedJson;
            }
            const textWithComments = replaceCommentPropertiesWithComments(text);
            fs.writeFile(generator.launchJsonPath, textWithComments, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
function addAssets(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        if (generator.hasExecutableProjects() && !generator.isStartupProjectSelected()) {
            if (!(yield generator.selectStartupProject())) {
                return;
            }
        }
        const promises = [
            addTasksJsonIfNecessary(generator, operations),
            addLaunchJsonIfNecessary(generator, operations)
        ];
        return Promise.all(promises);
    });
}
var AddAssetResult;
(function (AddAssetResult) {
    AddAssetResult[AddAssetResult["NotApplicable"] = 0] = "NotApplicable";
    AddAssetResult[AddAssetResult["Done"] = 1] = "Done";
    AddAssetResult[AddAssetResult["Disable"] = 2] = "Disable";
    AddAssetResult[AddAssetResult["Cancelled"] = 3] = "Cancelled";
})(AddAssetResult = exports.AddAssetResult || (exports.AddAssetResult = {}));
function addAssetsIfNecessary(server) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!vscode.workspace.workspaceFolders) {
                return resolve(AddAssetResult.NotApplicable);
            }
            serverUtils.requestWorkspaceInformation(server).then((info) => __awaiter(this, void 0, void 0, function* () {
                const generator = new AssetGenerator(info);
                // If there aren't executable projects, we will not prompt
                if (generator.hasExecutableProjects()) {
                    return getOperations(generator).then(operations => {
                        if (!hasAddOperations(operations)) {
                            return resolve(AddAssetResult.NotApplicable);
                        }
                        promptToAddAssets(generator.workspaceFolder).then(result => {
                            if (result === PromptResult.Disable) {
                                return resolve(AddAssetResult.Disable);
                            }
                            if (result !== PromptResult.Yes) {
                                return resolve(AddAssetResult.Cancelled);
                            }
                            fs.ensureDir(generator.vscodeFolder, err => {
                                addAssets(generator, operations).then(() => resolve(AddAssetResult.Done));
                            });
                        });
                    });
                }
            })).catch(err => reject(err));
        });
    });
}
exports.addAssetsIfNecessary = addAssetsIfNecessary;
function getExistingAssets(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a, _b, _c, _d;
            let assets = [];
            if (fs.pathExistsSync(generator.tasksJsonPath)) {
                const content = fs.readFileSync(generator.tasksJsonPath).toString();
                let taskLabels = ["build", "publish", "watch"];
                const tasks = (_b = (_a = jsonc.parse(content)) === null || _a === void 0 ? void 0 : _a.tasks) === null || _b === void 0 ? void 0 : _b.map((t) => t.label).filter((l) => taskLabels.includes(l));
                assets = assets.concat(tasks);
            }
            if (fs.pathExistsSync(generator.launchJsonPath)) {
                const content = fs.readFileSync(generator.launchJsonPath).toString();
                let configurationNames = [
                    ".NET Core Launch (console)",
                    ".NET Core Launch (web)",
                    ".NET Core Attach",
                    "Launch and Debug Standalone Blazor WebAssembly App",
                ];
                const configurations = (_d = (_c = jsonc.parse(content)) === null || _c === void 0 ? void 0 : _c.configurations) === null || _d === void 0 ? void 0 : _d.map((t) => t.name).filter((n) => configurationNames.includes(n));
                assets = assets.concat(configurations);
            }
            resolve(assets);
        });
    });
}
function shouldGenerateAssets(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            getExistingAssets(generator).then(res => {
                if (res && res.length) {
                    const yesItem = { title: 'Yes' };
                    const cancelItem = { title: 'Cancel', isCloseAffordance: true };
                    vscode.window.showWarningMessage('Replace existing build and debug assets?', cancelItem, yesItem)
                        .then(selection => {
                        if (selection === yesItem) {
                            resolve(true);
                        }
                        else {
                            // The user clicked cancel
                            resolve(false);
                        }
                    });
                }
                else {
                    // The assets don't exist, so we're good to go.
                    resolve(true);
                }
            });
        });
    });
}
function generateAssets(server, selectedIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let workspaceInformation = yield serverUtils.requestWorkspaceInformation(server);
            if (workspaceInformation.MsBuild && workspaceInformation.MsBuild.Projects.length > 0) {
                const generator = new AssetGenerator(workspaceInformation);
                let doGenerateAssets = yield shouldGenerateAssets(generator);
                if (!doGenerateAssets) {
                    return; // user cancelled
                }
                const operations = {
                    addLaunchJson: generator.hasExecutableProjects(),
                    addTasksJson: true
                };
                if (operations.addLaunchJson) {
                    if (!(yield generator.selectStartupProject(selectedIndex))) {
                        return; // user cancelled
                    }
                }
                yield fs.ensureDir(generator.vscodeFolder);
                yield addAssets(generator, operations);
            }
            else {
                yield vscode.window.showErrorMessage("Could not locate .NET Core project. Assets were not generated.");
            }
        }
        catch (err) {
            yield vscode.window.showErrorMessage(`Unable to generate assets to build and debug. ${err}`);
        }
    });
}
exports.generateAssets = generateAssets;
function replaceCommentPropertiesWithComments(text) {
    // replacing dummy properties OS-COMMENT with the normal comment syntax
    let regex = /["']OS-COMMENT\d*["']\s*\:\s*["'](.*)["']\s*?,/gi;
    let withComments = text.replace(regex, '// $1');
    return withComments;
}
exports.replaceCommentPropertiesWithComments = replaceCommentPropertiesWithComments;
function updateJsonWithComments(text, replacements, nodeName, keyName, formattingOptions) {
    let modificationOptions = {
        formattingOptions
    };
    // parse using jsonc because there are comments
    // only use this to determine what to change
    // we will modify it as text to keep existing comments
    let parsed = jsonc.parse(text);
    let items = parsed[nodeName];
    let itemKeys = items.map((i) => i[keyName]);
    let modified = text;
    // count how many items we inserted to ensure we are putting items at the end
    // in the same order as they are in the replacements array
    let insertCount = 0;
    replacements.map((replacement) => {
        let index = itemKeys.indexOf(replacement[keyName]);
        let found = index >= 0;
        let modificationIndex = found ? index : items.length + insertCount++;
        let edits = jsonc.modify(modified, [nodeName, modificationIndex], replacement, modificationOptions);
        let updated = jsonc.applyEdits(modified, edits);
        // we need to carry out the changes one by one, because we are inserting into the json
        // and so we cannot just figure out all the edits from the original text, instead we need to apply
        // changes one by one
        modified = updated;
    });
    return replaceCommentPropertiesWithComments(modified);
}
exports.updateJsonWithComments = updateJsonWithComments;
//# sourceMappingURL=assets.js.map