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
exports.CSharpConfigurationProvider = void 0;
const fs = require("fs-extra");
const path = require("path");
const serverUtils = require("./omnisharp/utils");
const vscode = require("vscode");
const ParsedEnvironmentFile_1 = require("./coreclr-debug/ParsedEnvironmentFile");
const assets_1 = require("./assets");
const common_1 = require("./common");
const jsonc_parser_1 = require("jsonc-parser");
class CSharpConfigurationProvider {
    constructor(server) {
        this.server = server;
    }
    /**
     * TODO: Remove function when https://github.com/OmniSharp/omnisharp-roslyn/issues/909 is resolved.
     *
     * Note: serverUtils.requestWorkspaceInformation only retrieves one folder for multi-root workspaces. Therefore, generator will be incorrect for all folders
     * except the first in a workspace. Currently, this only works if the requested folder is the same as the server's solution path or folder.
     */
    checkWorkspaceInformationMatchesWorkspaceFolder(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const solutionPathOrFolder = this.server.getSolutionPathOrFolder();
            // Make sure folder, folder.uri, and solutionPathOrFolder are defined.
            if (!solutionPathOrFolder) {
                return Promise.resolve(false);
            }
            let serverFolder = solutionPathOrFolder;
            // If its a .sln or .slnf file, get the folder of the solution.
            return fs.lstat(solutionPathOrFolder).then(stat => {
                return stat.isFile();
            }).then(isFile => {
                if (isFile) {
                    serverFolder = path.dirname(solutionPathOrFolder);
                }
                // Get absolute paths of current folder and server folder.
                const currentFolder = path.resolve(folder.uri.fsPath);
                serverFolder = path.resolve(serverFolder);
                return currentFolder && folder.uri && common_1.isSubfolderOf(serverFolder, currentFolder);
            });
        });
    }
    /**
     * Returns a list of initial debug configurations based on contextual information, e.g. package.json or folder.
     */
    provideDebugConfigurations(folder, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!folder || !folder.uri) {
                vscode.window.showErrorMessage("Cannot create .NET debug configurations. No workspace folder was selected.");
                return [];
            }
            if (!this.server.isRunning()) {
                vscode.window.showErrorMessage("Cannot create .NET debug configurations. The OmniSharp server is still initializing or has exited unexpectedly.");
                return [];
            }
            try {
                let hasWorkspaceMatches = yield this.checkWorkspaceInformationMatchesWorkspaceFolder(folder);
                if (!hasWorkspaceMatches) {
                    vscode.window.showErrorMessage(`Cannot create .NET debug configurations. The active C# project is not within folder '${folder.uri.fsPath}'.`);
                    return [];
                }
                let info = yield serverUtils.requestWorkspaceInformation(this.server);
                const generator = new assets_1.AssetGenerator(info, folder);
                if (generator.hasExecutableProjects()) {
                    if (!(yield generator.selectStartupProject())) {
                        return [];
                    }
                    // Make sure .vscode folder exists, addTasksJsonIfNecessary will fail to create tasks.json if the folder does not exist.
                    yield fs.ensureDir(generator.vscodeFolder);
                    // Add a tasks.json
                    const buildOperations = yield assets_1.getBuildOperations(generator);
                    yield assets_1.addTasksJsonIfNecessary(generator, buildOperations);
                    const programLaunchType = generator.computeProgramLaunchType();
                    const launchJson = generator.createLaunchJsonConfigurationsArray(programLaunchType);
                    return launchJson;
                }
                else {
                    // Error to be caught in the .catch() below to write default C# configurations
                    throw new Error("Does not contain .NET Core projects.");
                }
            }
            catch (_a) {
                // Provider will always create an launch.json file. Providing default C# configurations.
                // jsonc-parser's parse to convert to JSON object without comments.
                return [
                    assets_1.createFallbackLaunchConfiguration(),
                    jsonc_parser_1.parse(assets_1.createAttachConfiguration())
                ];
            }
        });
    }
    /**
     * Parse envFile and add to config.env
     */
    parseEnvFile(envFile, config) {
        if (envFile) {
            try {
                const parsedFile = ParsedEnvironmentFile_1.ParsedEnvironmentFile.CreateFromFile(envFile, config["env"]);
                // show error message if single lines cannot get parsed
                if (parsedFile.Warning) {
                    CSharpConfigurationProvider.showFileWarningAsync(parsedFile.Warning, envFile);
                }
                config.env = parsedFile.Env;
            }
            catch (e) {
                throw new Error(`Can't parse envFile ${envFile} because of ${e}`);
            }
        }
        // remove envFile from config after parsing
        if (config.envFile) {
            delete config.envFile;
        }
        return config;
    }
    /**
     * Try to add all missing attributes to the debug configuration being launched.
     */
    resolveDebugConfiguration(folder, config, token) {
        if (!config.type) {
            // If the config doesn't look functional force VSCode to open a configuration file https://github.com/Microsoft/vscode/issues/54213
            return null;
        }
        if (config.request === "launch") {
            if (!config.cwd && !config.pipeTransport) {
                config.cwd = "${workspaceFolder}";
            }
            if (!config.internalConsoleOptions) {
                config.internalConsoleOptions = "openOnSessionStart";
            }
            // read from envFile and set config.env
            if (config.envFile) {
                config = this.parseEnvFile(config.envFile.replace(/\${workspaceFolder}/g, folder.uri.fsPath), config);
            }
        }
        return config;
    }
    static showFileWarningAsync(message, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const openItem = { title: 'Open envFile' };
            let result = yield vscode.window.showWarningMessage(message, openItem);
            if (result && result.title === openItem.title) {
                let doc = yield vscode.workspace.openTextDocument(fileName);
                if (doc) {
                    vscode.window.showTextDocument(doc);
                }
            }
        });
    }
}
exports.CSharpConfigurationProvider = CSharpConfigurationProvider;
//# sourceMappingURL=configurationProvider.js.map