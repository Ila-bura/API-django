"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
class Options {
    constructor(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, organizeImportsOnFormat, showReferencesCodeLens, showTestsCodeLens, filteredSymbolsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, showOmnisharpLogOnError, minFindSymbolsFilterLength, maxFindSymbolsItems, razorDisabled, razorDevMode, enableMsBuildLoadProjectsOnDemand, enableRoslynAnalyzers, enableEditorConfigSupport, enableDecompilationSupport, enableImportCompletion, enableAsyncCompletion, useSemanticHighlighting, razorPluginPath, defaultLaunchSolution, monoPath, excludePaths, maxProjectFileCountForDiagnosticAnalysis) {
        this.path = path;
        this.useGlobalMono = useGlobalMono;
        this.waitForDebugger = waitForDebugger;
        this.loggingLevel = loggingLevel;
        this.autoStart = autoStart;
        this.projectLoadTimeout = projectLoadTimeout;
        this.maxProjectResults = maxProjectResults;
        this.useEditorFormattingSettings = useEditorFormattingSettings;
        this.useFormatting = useFormatting;
        this.organizeImportsOnFormat = organizeImportsOnFormat;
        this.showReferencesCodeLens = showReferencesCodeLens;
        this.showTestsCodeLens = showTestsCodeLens;
        this.filteredSymbolsCodeLens = filteredSymbolsCodeLens;
        this.disableCodeActions = disableCodeActions;
        this.disableMSBuildDiagnosticWarning = disableMSBuildDiagnosticWarning;
        this.showOmnisharpLogOnError = showOmnisharpLogOnError;
        this.minFindSymbolsFilterLength = minFindSymbolsFilterLength;
        this.maxFindSymbolsItems = maxFindSymbolsItems;
        this.razorDisabled = razorDisabled;
        this.razorDevMode = razorDevMode;
        this.enableMsBuildLoadProjectsOnDemand = enableMsBuildLoadProjectsOnDemand;
        this.enableRoslynAnalyzers = enableRoslynAnalyzers;
        this.enableEditorConfigSupport = enableEditorConfigSupport;
        this.enableDecompilationSupport = enableDecompilationSupport;
        this.enableImportCompletion = enableImportCompletion;
        this.enableAsyncCompletion = enableAsyncCompletion;
        this.useSemanticHighlighting = useSemanticHighlighting;
        this.razorPluginPath = razorPluginPath;
        this.defaultLaunchSolution = defaultLaunchSolution;
        this.monoPath = monoPath;
        this.excludePaths = excludePaths;
        this.maxProjectFileCountForDiagnosticAnalysis = maxProjectFileCountForDiagnosticAnalysis;
    }
    static Read(vscode) {
        // Extra effort is taken below to ensure that legacy versions of options
        // are supported below. In particular, these are:
        //
        // - "csharp.omnisharp" -> "omnisharp.path"
        // - "csharp.omnisharpUsesMono" -> "omnisharp.useMono"
        // - "omnisharp.useMono" -> "omnisharp.useGlobalMono"
        const omnisharpConfig = vscode.workspace.getConfiguration('omnisharp');
        const csharpConfig = vscode.workspace.getConfiguration('csharp');
        const razorConfig = vscode.workspace.getConfiguration('razor');
        const path = Options.readPathOption(csharpConfig, omnisharpConfig);
        const useGlobalMono = Options.readUseGlobalMonoOption(omnisharpConfig, csharpConfig);
        const monoPath = omnisharpConfig.get('monoPath', undefined) || undefined;
        const waitForDebugger = omnisharpConfig.get('waitForDebugger', false);
        // support the legacy "verbose" level as "debug"
        let loggingLevel = omnisharpConfig.get('loggingLevel', 'information');
        if (loggingLevel && loggingLevel.toLowerCase() === 'verbose') {
            loggingLevel = 'debug';
        }
        const autoStart = omnisharpConfig.get('autoStart', true);
        const projectLoadTimeout = omnisharpConfig.get('projectLoadTimeout', 60);
        const maxProjectResults = omnisharpConfig.get('maxProjectResults', 250);
        const defaultLaunchSolution = omnisharpConfig.get('defaultLaunchSolution', undefined);
        const useEditorFormattingSettings = omnisharpConfig.get('useEditorFormattingSettings', true);
        const enableRoslynAnalyzers = omnisharpConfig.get('enableRoslynAnalyzers', false);
        const enableEditorConfigSupport = omnisharpConfig.get('enableEditorConfigSupport', false);
        const enableDecompilationSupport = omnisharpConfig.get('enableDecompilationSupport', false);
        const enableImportCompletion = omnisharpConfig.get('enableImportCompletion', false);
        const enableAsyncCompletion = omnisharpConfig.get('enableAsyncCompletion', false);
        const useFormatting = csharpConfig.get('format.enable', true);
        const organizeImportsOnFormat = omnisharpConfig.get('organizeImportsOnFormat', false);
        const showReferencesCodeLens = csharpConfig.get('referencesCodeLens.enabled', true);
        const showTestsCodeLens = csharpConfig.get('testsCodeLens.enabled', true);
        const filteredSymbolsCodeLens = csharpConfig.get('referencesCodeLens.filteredSymbols', []);
        const useSemanticHighlighting = csharpConfig.get('semanticHighlighting.enabled', false);
        const disableCodeActions = csharpConfig.get('disableCodeActions', false);
        const disableMSBuildDiagnosticWarning = omnisharpConfig.get('disableMSBuildDiagnosticWarning', false);
        const showOmnisharpLogOnError = csharpConfig.get('showOmnisharpLogOnError', true);
        const minFindSymbolsFilterLength = omnisharpConfig.get('minFindSymbolsFilterLength', 0);
        const maxFindSymbolsItems = omnisharpConfig.get('maxFindSymbolsItems', 1000); // The limit is applied only when this setting is set to a number greater than zero
        const enableMsBuildLoadProjectsOnDemand = omnisharpConfig.get('enableMsBuildLoadProjectsOnDemand', false);
        const razorDisabled = !!razorConfig && razorConfig.get('disabled', false);
        const razorDevMode = !!razorConfig && razorConfig.get('devmode', false);
        const razorPluginPath = razorConfig ? razorConfig.get('plugin.path', undefined) : undefined;
        const maxProjectFileCountForDiagnosticAnalysis = csharpConfig.get('maxProjectFileCountForDiagnosticAnalysis', 1000);
        const excludePaths = this.getExcludedPaths(vscode);
        return new Options(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, organizeImportsOnFormat, showReferencesCodeLens, showTestsCodeLens, filteredSymbolsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, showOmnisharpLogOnError, minFindSymbolsFilterLength, maxFindSymbolsItems, razorDisabled, razorDevMode, enableMsBuildLoadProjectsOnDemand, enableRoslynAnalyzers, enableEditorConfigSupport, enableDecompilationSupport, enableImportCompletion, enableAsyncCompletion, useSemanticHighlighting, razorPluginPath, defaultLaunchSolution, monoPath, excludePaths, maxProjectFileCountForDiagnosticAnalysis);
    }
    static getExcludedPaths(vscode, includeSearchExcludes = false) {
        let workspaceConfig = vscode.workspace.getConfiguration(undefined, null);
        if (!workspaceConfig) {
            return [];
        }
        let excludePaths = getExcludes(workspaceConfig, 'files.exclude');
        if (includeSearchExcludes) {
            excludePaths = excludePaths.concat(getExcludes(workspaceConfig, 'search.exclude'));
        }
        return excludePaths;
        function getExcludes(config, option) {
            let optionValue = config.get(option);
            if (!optionValue) {
                return [];
            }
            return Object.entries(optionValue)
                .filter(([key, value]) => value)
                .map(([key, value]) => key);
        }
    }
    static readPathOption(csharpConfig, omnisharpConfig) {
        if (omnisharpConfig.has('path')) {
            // If 'omnisharp.path' setting was found, use it.
            return omnisharpConfig.get('path');
        }
        else if (csharpConfig.has('omnisharp')) {
            // BACKCOMPAT: If 'csharp.omnisharp' setting was found, use it.
            return csharpConfig.get('omnisharp');
        }
        else {
            // Otherwise, null.
            return null;
        }
    }
    static readUseGlobalMonoOption(omnisharpConfig, csharpConfig) {
        function toUseGlobalMonoValue(value) {
            // True means 'always' and false means 'auto'.
            return value ? "always" : "auto";
        }
        if (omnisharpConfig.has('useGlobalMono')) {
            // If 'omnisharp.useGlobalMono' setting was found, just use it.
            return omnisharpConfig.get('useGlobalMono', "auto");
        }
        else if (omnisharpConfig.has('useMono')) {
            // BACKCOMPAT: If 'omnisharp.useMono' setting was found, true maps to "always" and false maps to "auto"
            return toUseGlobalMonoValue(omnisharpConfig.get('useMono'));
        }
        else if (csharpConfig.has('omnisharpUsesMono')) {
            // BACKCOMPAT: If 'csharp.omnisharpUsesMono' setting was found, true maps to "always" and false maps to "auto"
            return toUseGlobalMonoValue(csharpConfig.get('omnisharpUsesMono'));
        }
        else {
            // Otherwise, the default value is "auto".
            return "auto";
        }
    }
}
exports.Options = Options;
//# sourceMappingURL=options.js.map