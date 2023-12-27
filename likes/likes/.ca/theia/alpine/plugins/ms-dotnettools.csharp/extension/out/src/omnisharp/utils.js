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
exports.isNetCoreProject = exports.getCompletionAfterInsert = exports.getCompletionResolve = exports.getCompletion = exports.getQuickInfo = exports.getSemanticHighlights = exports.debugTestStop = exports.debugTestLaunch = exports.debugTestsInContextGetStartInfo = exports.debugTestClassGetStartInfo = exports.debugTestGetStartInfo = exports.runTestsInContext = exports.runTestsInClass = exports.runTest = exports.getTestStartInfo = exports.reAnalyze = exports.getMetadata = exports.updateBuffer = exports.typeLookup = exports.signatureHelp = exports.runCodeAction = exports.requestWorkspaceInformation = exports.requestProjectInformation = exports.rename = exports.goToDefinition = exports.getCodeActions = exports.formatRange = exports.formatAfterKeystroke = exports.findUsages = exports.getFixAll = exports.runFixAll = exports.findSymbols = exports.findImplementations = exports.filesChanged = exports.discoverTests = exports.codeStructure = exports.blockStructure = exports.codeCheck = void 0;
const fs = require("fs-extra");
const path = require("path");
const protocol = require("./protocol");
const vscode = require("vscode");
function codeCheck(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.CodeCheck, request, token);
    });
}
exports.codeCheck = codeCheck;
function blockStructure(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.BlockStructure, request, token);
    });
}
exports.blockStructure = blockStructure;
function codeStructure(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.CodeStructure, request, token);
    });
}
exports.codeStructure = codeStructure;
function discoverTests(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DiscoverTests, request);
    });
}
exports.discoverTests = discoverTests;
function filesChanged(server, requests) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FilesChanged, requests);
    });
}
exports.filesChanged = filesChanged;
function findImplementations(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindImplementations, request);
    });
}
exports.findImplementations = findImplementations;
function findSymbols(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindSymbols, request, token);
    });
}
exports.findSymbols = findSymbols;
function runFixAll(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.RunFixAll, request);
    });
}
exports.runFixAll = runFixAll;
function getFixAll(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.GetFixAll, request);
    });
}
exports.getFixAll = getFixAll;
function findUsages(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindUsages, request, token);
    });
}
exports.findUsages = findUsages;
function formatAfterKeystroke(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FormatAfterKeystroke, request, token);
    });
}
exports.formatAfterKeystroke = formatAfterKeystroke;
function formatRange(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FormatRange, request, token);
    });
}
exports.formatRange = formatRange;
function getCodeActions(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.GetCodeActions, request, token);
    });
}
exports.getCodeActions = getCodeActions;
function goToDefinition(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.GoToDefinition, request);
    });
}
exports.goToDefinition = goToDefinition;
function rename(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Rename, request, token);
    });
}
exports.rename = rename;
function requestProjectInformation(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Project, request);
    });
}
exports.requestProjectInformation = requestProjectInformation;
function requestWorkspaceInformation(server) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield server.makeRequest(protocol.Requests.Projects);
        if (response.MsBuild && response.MsBuild.Projects) {
            let blazorWebAssemblyProjectFound = false;
            for (const project of response.MsBuild.Projects) {
                project.IsWebProject = isWebProject(project);
                const isProjectBlazorWebAssemblyProject = yield isBlazorWebAssemblyProject(project);
                const isProjectBlazorWebAssemblyHosted = isBlazorWebAssemblyHosted(project, isProjectBlazorWebAssemblyProject);
                project.IsBlazorWebAssemblyHosted = isProjectBlazorWebAssemblyHosted;
                project.IsBlazorWebAssemblyStandalone = isProjectBlazorWebAssemblyProject && !project.IsBlazorWebAssemblyHosted;
                blazorWebAssemblyProjectFound = blazorWebAssemblyProjectFound || isProjectBlazorWebAssemblyProject;
            }
            if (blazorWebAssemblyProjectFound && !hasBlazorWebAssemblyDebugPrerequisites(server)) {
                const configuration = vscode.workspace.getConfiguration('razor');
                // There's a Blazor Web Assembly project but VSCode isn't configured to debug the WASM code, show a notification
                // to help the user configure their VSCode appropriately.
                showBlazorConfigurationRequiredPrompt(server, configuration);
            }
        }
        return response;
    });
}
exports.requestWorkspaceInformation = requestWorkspaceInformation;
function runCodeAction(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunCodeAction, request);
    });
}
exports.runCodeAction = runCodeAction;
function signatureHelp(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.SignatureHelp, request, token);
    });
}
exports.signatureHelp = signatureHelp;
function typeLookup(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.TypeLookup, request, token);
    });
}
exports.typeLookup = typeLookup;
function updateBuffer(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.UpdateBuffer, request);
    });
}
exports.updateBuffer = updateBuffer;
function getMetadata(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Metadata, request);
    });
}
exports.getMetadata = getMetadata;
function reAnalyze(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.ReAnalyze, request);
    });
}
exports.reAnalyze = reAnalyze;
function getTestStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.GetTestStartInfo, request);
    });
}
exports.getTestStartInfo = getTestStartInfo;
function runTest(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunTest, request);
    });
}
exports.runTest = runTest;
function runTestsInClass(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunAllTestsInClass, request);
    });
}
exports.runTestsInClass = runTestsInClass;
function runTestsInContext(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunTestsInContext, request);
    });
}
exports.runTestsInContext = runTestsInContext;
function debugTestGetStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestGetStartInfo, request);
    });
}
exports.debugTestGetStartInfo = debugTestGetStartInfo;
function debugTestClassGetStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestsInClassGetStartInfo, request);
    });
}
exports.debugTestClassGetStartInfo = debugTestClassGetStartInfo;
function debugTestsInContextGetStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestsInContextGetStartInfo, request);
    });
}
exports.debugTestsInContextGetStartInfo = debugTestsInContextGetStartInfo;
function debugTestLaunch(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestLaunch, request);
    });
}
exports.debugTestLaunch = debugTestLaunch;
function debugTestStop(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestStop, request);
    });
}
exports.debugTestStop = debugTestStop;
function getSemanticHighlights(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.Highlight, request);
    });
}
exports.getSemanticHighlights = getSemanticHighlights;
function getQuickInfo(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.QuickInfo, request, token);
    });
}
exports.getQuickInfo = getQuickInfo;
function getCompletion(server, request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Completion, request, context);
    });
}
exports.getCompletion = getCompletion;
function getCompletionResolve(server, request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.CompletionResolve, request, context);
    });
}
exports.getCompletionResolve = getCompletionResolve;
function getCompletionAfterInsert(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.CompletionAfterInsert, request);
    });
}
exports.getCompletionAfterInsert = getCompletionAfterInsert;
function isNetCoreProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp') || tf.ShortName.startsWith('netstandard')) !== undefined;
    });
}
exports.isNetCoreProject = isNetCoreProject;
function isBlazorWebAssemblyHosted(project, isProjectBlazorWebAssemblyProject) {
    if (!isProjectBlazorWebAssemblyProject) {
        return false;
    }
    if (!project.IsExe) {
        return false;
    }
    if (!project.IsWebProject) {
        return false;
    }
    if (protocol.findNetCoreAppTargetFramework(project) === undefined) {
        return false;
    }
    return true;
}
function isBlazorWebAssemblyProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectDirectory = path.dirname(project.Path);
        const launchSettingsPath = path.join(projectDirectory, 'Properties', 'launchSettings.json');
        try {
            if (!fs.pathExistsSync(launchSettingsPath)) {
                return false;
            }
            const launchSettingContent = fs.readFileSync(launchSettingsPath);
            if (!launchSettingContent) {
                return false;
            }
            if (launchSettingContent.indexOf('"inspectUri"') > 0) {
                return true;
            }
        }
        catch (_a) {
            // Swallow IO errors from reading the launchSettings.json files
        }
        return false;
    });
}
function hasBlazorWebAssemblyDebugPrerequisites(server) {
    const companionExtension = vscode.extensions.getExtension('ms-dotnettools.blazorwasm-companion');
    if (!companionExtension) {
        showBlazorDebuggingExtensionPrompt(server);
        return false;
    }
    const debugJavaScriptConfigSection = vscode.workspace.getConfiguration('debug.javascript');
    const usePreviewValue = debugJavaScriptConfigSection.get('usePreview');
    if (usePreviewValue) {
        // If usePreview is truthy it takes priority over the useV3 variants.
        return true;
    }
    const debugNodeConfigSection = vscode.workspace.getConfiguration('debug.node');
    const useV3NodeValue = debugNodeConfigSection.get('useV3');
    if (!useV3NodeValue) {
        return false;
    }
    const debugChromeConfigSection = vscode.workspace.getConfiguration('debug.chrome');
    const useV3ChromeValue = debugChromeConfigSection.get('useV3');
    if (!useV3ChromeValue) {
        return false;
    }
    return true;
}
function isWebProject(project) {
    let projectFileText = fs.readFileSync(project.Path, 'utf8');
    // Assume that this is an MSBuild project. In that case, look for the 'Sdk="Microsoft.NET.Sdk.Web"' attribute.
    // TODO: Have OmniSharp provide the list of SDKs used by a project and check that list instead.
    return projectFileText.toLowerCase().indexOf('sdk="microsoft.net.sdk.web"') >= 0;
}
function showBlazorConfigurationRequiredPrompt(server, configuration) {
    const disableBlazorDebugPrompt = configuration.get('disableBlazorDebugPrompt');
    const promptShownKey = 'blazor_configuration_required_prompt_shown';
    if (!disableBlazorDebugPrompt && !server.sessionProperties[promptShownKey]) {
        server.sessionProperties[promptShownKey] = true;
        vscode.window.showInformationMessage('Additional setup is required to debug Blazor WebAssembly applications.', 'Don\'t Ask Again', 'Learn more', 'Close')
            .then((result) => __awaiter(this, void 0, void 0, function* () {
            if (result === 'Learn more') {
                const uriToOpen = vscode.Uri.parse('https://aka.ms/blazordebugging#vscode');
                yield vscode.commands.executeCommand('vscode.open', uriToOpen);
            }
            if (result === 'Don\'t Ask Again') {
                yield configuration.update('disableBlazorDebugPrompt', true);
            }
        }));
    }
}
function showBlazorDebuggingExtensionPrompt(server) {
    const promptShownKey = 'blazor_debugging_extension_prompt_shown';
    if (!server.sessionProperties[promptShownKey]) {
        server.sessionProperties[promptShownKey] = true;
        const msg = 'The Blazor WASM Debugging Extension is required to debug Blazor WASM apps in VS Code.';
        vscode.window.showInformationMessage(msg, 'Install Extension', 'Close')
            .then((result) => __awaiter(this, void 0, void 0, function* () {
            if (result === 'Install Extension') {
                const uriToOpen = vscode.Uri.parse('vscode:extension/ms-dotnettools.blazorwasm-companion');
                yield vscode.commands.executeCommand('vscode.open', uriToOpen);
            }
        }));
    }
}
//# sourceMappingURL=utils.js.map