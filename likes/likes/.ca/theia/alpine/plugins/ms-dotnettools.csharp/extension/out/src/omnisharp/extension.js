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
exports.activate = void 0;
const utils = require("./utils");
const vscode = require("vscode");
const assets_1 = require("../assets");
const diagnosticsProvider_1 = require("../features/diagnosticsProvider");
const common_1 = require("../common");
const configurationProvider_1 = require("../configurationProvider");
const codeActionProvider_1 = require("../features/codeActionProvider");
const codeLensProvider_1 = require("../features/codeLensProvider");
const completionProvider_1 = require("../features/completionProvider");
const definitionMetadataDocumentProvider_1 = require("../features/definitionMetadataDocumentProvider");
const definitionProvider_1 = require("../features/definitionProvider");
const documentHighlightProvider_1 = require("../features/documentHighlightProvider");
const documentSymbolProvider_1 = require("../features/documentSymbolProvider");
const formattingEditProvider_1 = require("../features/formattingEditProvider");
const hoverProvider_1 = require("../features/hoverProvider");
const implementationProvider_1 = require("../features/implementationProvider");
const server_1 = require("./server");
const referenceProvider_1 = require("../features/referenceProvider");
const renameProvider_1 = require("../features/renameProvider");
const signatureHelpProvider_1 = require("../features/signatureHelpProvider");
const dotnetTest_1 = require("../features/dotnetTest");
const workspaceSymbolProvider_1 = require("../features/workspaceSymbolProvider");
const changeForwarding_1 = require("../features/changeForwarding");
const commands_1 = require("../features/commands");
const loggingEvents_1 = require("./loggingEvents");
const CompositeDisposable_1 = require("../CompositeDisposable");
const Disposable_1 = require("../Disposable");
const virtualDocumentTracker_1 = require("../features/virtualDocumentTracker");
const structureProvider_1 = require("../features/structureProvider");
const OmniSharpMonoResolver_1 = require("./OmniSharpMonoResolver");
const getMonoVersion_1 = require("../utils/getMonoVersion");
const fixAllProvider_1 = require("../features/fixAllProvider");
const LanguageMiddlewareFeature_1 = require("./LanguageMiddlewareFeature");
const semanticTokensProvider_1 = require("../features/semanticTokensProvider");
function activate(context, packageJSON, platformInfo, provider, eventStream, optionProvider, extensionPath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const documentSelector = {
            language: 'csharp',
        };
        const options = optionProvider.GetLatestOptions();
        let omnisharpMonoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMonoVersion_1.getMonoVersion);
        const decompilationAuthorized = (_a = context.workspaceState.get("decompilationAuthorized")) !== null && _a !== void 0 ? _a : false;
        const server = new server_1.OmniSharpServer(vscode, provider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath, omnisharpMonoResolver, decompilationAuthorized);
        const advisor = new diagnosticsProvider_1.Advisor(server, optionProvider); // create before server is started
        const disposables = new CompositeDisposable_1.default();
        const languageMiddlewareFeature = new LanguageMiddlewareFeature_1.LanguageMiddlewareFeature();
        languageMiddlewareFeature.register();
        disposables.add(languageMiddlewareFeature);
        let localDisposables;
        const testManager = new dotnetTest_1.default(server, eventStream, languageMiddlewareFeature);
        const completionProvider = new completionProvider_1.default(server, languageMiddlewareFeature);
        disposables.add(server.onServerStart(() => {
            // register language feature provider on start
            localDisposables = new CompositeDisposable_1.default();
            const definitionMetadataDocumentProvider = new definitionMetadataDocumentProvider_1.default();
            definitionMetadataDocumentProvider.register();
            localDisposables.add(definitionMetadataDocumentProvider);
            const definitionProvider = new definitionProvider_1.default(server, definitionMetadataDocumentProvider, languageMiddlewareFeature);
            localDisposables.add(vscode.languages.registerDefinitionProvider(documentSelector, definitionProvider));
            localDisposables.add(vscode.languages.registerDefinitionProvider({ scheme: definitionMetadataDocumentProvider.scheme }, definitionProvider));
            localDisposables.add(vscode.languages.registerImplementationProvider(documentSelector, new implementationProvider_1.default(server, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerCodeLensProvider(documentSelector, new codeLensProvider_1.default(server, testManager, optionProvider, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerDocumentHighlightProvider(documentSelector, new documentHighlightProvider_1.default(server, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerDocumentSymbolProvider(documentSelector, new documentSymbolProvider_1.default(server, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerReferenceProvider(documentSelector, new referenceProvider_1.default(server, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerHoverProvider(documentSelector, new hoverProvider_1.default(server, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerRenameProvider(documentSelector, new renameProvider_1.default(server, languageMiddlewareFeature)));
            if (options.useFormatting) {
                localDisposables.add(vscode.languages.registerDocumentRangeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server, languageMiddlewareFeature)));
                localDisposables.add(vscode.languages.registerOnTypeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server, languageMiddlewareFeature), '}', '/', '\n', ';'));
            }
            localDisposables.add(vscode.languages.registerCompletionItemProvider(documentSelector, completionProvider, '.', ' '));
            localDisposables.add(vscode.commands.registerCommand(completionProvider_1.CompletionAfterInsertCommand, (item) => __awaiter(this, void 0, void 0, function* () { return completionProvider.afterInsert(item); })));
            localDisposables.add(vscode.languages.registerWorkspaceSymbolProvider(new workspaceSymbolProvider_1.default(server, optionProvider, languageMiddlewareFeature)));
            localDisposables.add(vscode.languages.registerSignatureHelpProvider(documentSelector, new signatureHelpProvider_1.default(server, languageMiddlewareFeature), '(', ','));
            // Since the CodeActionProvider registers its own commands, we must instantiate it and add it to the localDisposables
            // so that it will be cleaned up if OmniSharp is restarted.
            const codeActionProvider = new codeActionProvider_1.default(server, optionProvider, languageMiddlewareFeature);
            localDisposables.add(codeActionProvider);
            localDisposables.add(vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider));
            // Since the FixAllProviders registers its own commands, we must instantiate it and add it to the localDisposables
            // so that it will be cleaned up if OmniSharp is restarted.
            const fixAllProvider = new fixAllProvider_1.FixAllProvider(server, languageMiddlewareFeature);
            localDisposables.add(fixAllProvider);
            localDisposables.add(vscode.languages.registerCodeActionsProvider(documentSelector, fixAllProvider));
            localDisposables.add(diagnosticsProvider_1.default(server, advisor, languageMiddlewareFeature));
            localDisposables.add(changeForwarding_1.default(server));
            localDisposables.add(virtualDocumentTracker_1.default(server, eventStream));
            localDisposables.add(vscode.languages.registerFoldingRangeProvider(documentSelector, new structureProvider_1.StructureProvider(server, languageMiddlewareFeature)));
            const semanticTokensProvider = new semanticTokensProvider_1.default(server, optionProvider, languageMiddlewareFeature);
            localDisposables.add(vscode.languages.registerDocumentSemanticTokensProvider(documentSelector, semanticTokensProvider, semanticTokensProvider.getLegend()));
            localDisposables.add(vscode.languages.registerDocumentRangeSemanticTokensProvider(documentSelector, semanticTokensProvider, semanticTokensProvider.getLegend()));
        }));
        disposables.add(server.onServerStop(() => {
            // remove language feature providers on stop
            if (localDisposables) {
                localDisposables.dispose();
            }
            localDisposables = null;
        }));
        disposables.add(commands_1.default(context, server, platformInfo, eventStream, optionProvider, omnisharpMonoResolver, packageJSON, extensionPath));
        if (!context.workspaceState.get('assetPromptDisabled')) {
            disposables.add(server.onServerStart(() => {
                // Update or add tasks.json and launch.json
                assets_1.addAssetsIfNecessary(server).then(result => {
                    if (result === assets_1.AddAssetResult.Disable) {
                        context.workspaceState.update('assetPromptDisabled', true);
                    }
                });
            }));
        }
        // After server is started (and projects are loaded), check to see if there are
        // any project.json projects if the suppress option is not set. If so, notify the user about migration.
        let csharpConfig = vscode.workspace.getConfiguration('csharp');
        if (!csharpConfig.get('suppressProjectJsonWarning')) {
            disposables.add(server.onServerStart(() => {
                utils.requestWorkspaceInformation(server)
                    .then(workspaceInfo => {
                    if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                        const shortMessage = 'project.json is no longer a supported project format for .NET Core applications.';
                        const moreDetailItem = { title: 'More Detail' };
                        vscode.window.showWarningMessage(shortMessage, moreDetailItem)
                            .then(item => {
                            eventStream.post(new loggingEvents_1.ProjectJsonDeprecatedWarning());
                        });
                    }
                });
            }));
        }
        // Send telemetry about the sorts of projects the server was started on.
        disposables.add(server.onServerStart(() => {
            let measures = {};
            utils.requestWorkspaceInformation(server)
                .then(workspaceInfo => {
                if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                    measures['projectjson.projectcount'] = workspaceInfo.DotNet.Projects.length;
                    measures['projectjson.filecount'] = common_1.sum(workspaceInfo.DotNet.Projects, p => common_1.safeLength(p.SourceFiles));
                }
                if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects.length > 0) {
                    measures['msbuild.projectcount'] = workspaceInfo.MsBuild.Projects.length;
                    measures['msbuild.filecount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => common_1.safeLength(p.SourceFiles));
                    measures['msbuild.unityprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => p.IsUnityProject ? 1 : 0);
                    measures['msbuild.netcoreprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => utils.isNetCoreProject(p) ? 1 : 0);
                }
                // TODO: Add measurements for script.
                eventStream.post(new loggingEvents_1.OmnisharpStart('OmniSharp.Start', measures));
            });
        }));
        disposables.add(server.onBeforeServerStart(path => {
            if (options.razorDevMode) {
                eventStream.post(new loggingEvents_1.RazorDevModeActive());
            }
            // read and store last solution or folder path
            context.workspaceState.update('lastSolutionPathOrFolder', path);
        }));
        if (options.autoStart) {
            server.autoStart(context.workspaceState.get('lastSolutionPathOrFolder'));
        }
        // stop server on deactivate
        disposables.add(new Disposable_1.default(() => {
            testManager.dispose();
            advisor.dispose();
            server.stop();
        }));
        // Register ConfigurationProvider
        disposables.add(vscode.debug.registerDebugConfigurationProvider('coreclr', new configurationProvider_1.CSharpConfigurationProvider(server)));
        context.subscriptions.push(disposables);
        return new Promise(resolve => server.onServerStart(e => resolve({ server, advisor, testManager })));
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map