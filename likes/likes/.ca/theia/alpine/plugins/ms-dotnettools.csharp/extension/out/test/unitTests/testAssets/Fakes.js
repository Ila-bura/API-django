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
exports.updateConfig = exports.getVSCodeWithConfig = exports.getWorkspaceInformationUpdated = exports.getMSBuildWorkspaceInformation = exports.getFakeVsCode = exports.getUnresolvedDependenices = exports.getOmnisharpServerOnErrorEvent = exports.getMSBuildDiagnosticsMessage = exports.getOmnisharpMSBuildProjectDiagnosticsEvent = exports.getWorkspaceConfiguration = exports.getNullChannel = void 0;
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const getNullChannel = () => {
    let returnChannel = {
        name: "",
        append: (value) => { },
        appendLine: (value) => { },
        clear: () => { },
        show: (preserveFocusOrColumn, preserveFocus) => { },
        hide: () => { },
        dispose: () => { }
    };
    return returnChannel;
};
exports.getNullChannel = getNullChannel;
const getWorkspaceConfiguration = () => {
    let values = {};
    let configuration = {
        get(section, defaultValue) {
            let result = values[section];
            return result === undefined && defaultValue !== undefined
                ? defaultValue
                : result;
        },
        has: (section) => {
            return values[section] !== undefined;
        },
        inspect: () => { throw new Error("Not Implemented"); },
        update: (section, value, configurationTarget) => __awaiter(void 0, void 0, void 0, function* () {
            values[section] = value;
            return Promise.resolve();
        })
    };
    return configuration;
};
exports.getWorkspaceConfiguration = getWorkspaceConfiguration;
function getOmnisharpMSBuildProjectDiagnosticsEvent(fileName, warnings, errors) {
    return new loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics({
        FileName: fileName,
        Warnings: warnings,
        Errors: errors
    });
}
exports.getOmnisharpMSBuildProjectDiagnosticsEvent = getOmnisharpMSBuildProjectDiagnosticsEvent;
function getMSBuildDiagnosticsMessage(logLevel, fileName, text, startLine, startColumn, endLine, endColumn) {
    return {
        LogLevel: logLevel,
        FileName: fileName,
        Text: text,
        StartLine: startLine,
        StartColumn: startColumn,
        EndLine: endLine,
        EndColumn: endColumn
    };
}
exports.getMSBuildDiagnosticsMessage = getMSBuildDiagnosticsMessage;
function getOmnisharpServerOnErrorEvent(text, fileName, line, column) {
    return new loggingEvents_1.OmnisharpServerOnError({
        Text: text,
        FileName: fileName,
        Line: line,
        Column: column
    });
}
exports.getOmnisharpServerOnErrorEvent = getOmnisharpServerOnErrorEvent;
function getUnresolvedDependenices(fileName) {
    return new loggingEvents_1.OmnisharpServerUnresolvedDependencies({
        UnresolvedDependencies: [],
        FileName: fileName
    });
}
exports.getUnresolvedDependenices = getUnresolvedDependenices;
function getFakeVsCode() {
    return {
        commands: {
            executeCommand: (command, ...rest) => {
                throw new Error("Not Implemented");
            }
        },
        languages: {
            match: (selector, document) => {
                throw new Error("Not Implemented");
            }
        },
        window: {
            activeTextEditor: undefined,
            showInformationMessage: (message, ...items) => {
                throw new Error("Not Implemented");
            },
            showWarningMessage: (message, ...items) => {
                throw new Error("Not Implemented");
            },
            showErrorMessage: (message, ...items) => {
                throw new Error("Not Implemented");
            }
        },
        workspace: {
            getConfiguration: (section, resource) => {
                throw new Error("Not Implemented");
            },
            asRelativePath: (pathOrUri, includeWorkspaceFolder) => {
                throw new Error("Not Implemented");
            },
            createFileSystemWatcher: (globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) => {
                throw new Error("Not Implemented");
            },
            onDidChangeConfiguration: (listener, thisArgs, disposables) => {
                throw new Error("Not Implemented");
            }
        },
        extensions: {
            getExtension: () => {
                throw new Error("Not Implemented");
            },
            all: []
        },
        Uri: {
            parse: () => {
                throw new Error("Not Implemented");
            }
        },
        version: "",
        env: {
            appName: null,
            appRoot: null,
            language: null,
            clipboard: {
                writeText: () => {
                    throw new Error("Not Implemented");
                },
                readText: () => {
                    throw new Error("Not Implemented");
                }
            },
            machineId: null,
            sessionId: null,
            openExternal: () => {
                throw new Error("Not Implemented");
            }
        }
    };
}
exports.getFakeVsCode = getFakeVsCode;
function getMSBuildWorkspaceInformation(msBuildSolutionPath, msBuildProjects) {
    return {
        SolutionPath: msBuildSolutionPath,
        Projects: msBuildProjects
    };
}
exports.getMSBuildWorkspaceInformation = getMSBuildWorkspaceInformation;
function getWorkspaceInformationUpdated(msbuild) {
    let a = {
        MsBuild: msbuild
    };
    return new loggingEvents_1.WorkspaceInformationUpdated(a);
}
exports.getWorkspaceInformationUpdated = getWorkspaceInformationUpdated;
function getVSCodeWithConfig() {
    const vscode = getFakeVsCode();
    const _vscodeConfig = exports.getWorkspaceConfiguration();
    const _omnisharpConfig = exports.getWorkspaceConfiguration();
    const _csharpConfig = exports.getWorkspaceConfiguration();
    vscode.workspace.getConfiguration = (section, resource) => {
        if (!section) {
            return _vscodeConfig;
        }
        if (section === 'omnisharp') {
            return _omnisharpConfig;
        }
        if (section === 'csharp') {
            return _csharpConfig;
        }
        return undefined;
    };
    return vscode;
}
exports.getVSCodeWithConfig = getVSCodeWithConfig;
function updateConfig(vscode, section, config, value) {
    let workspaceConfig = vscode.workspace.getConfiguration(section);
    workspaceConfig.update(config, value);
}
exports.updateConfig = updateConfig;
//# sourceMappingURL=Fakes.js.map