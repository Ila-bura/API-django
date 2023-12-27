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
const OmniSharp = require("./omnisharp/extension");
const coreclrdebug = require("./coreclr-debug/activate");
const util = require("./common");
const vscode = require("vscode");
const loggingEvents_1 = require("./omnisharp/loggingEvents");
const WarningMessageObserver_1 = require("./observers/WarningMessageObserver");
const CsharpChannelObserver_1 = require("./observers/CsharpChannelObserver");
const CsharpLoggerObserver_1 = require("./observers/CsharpLoggerObserver");
const DotnetChannelObserver_1 = require("./observers/DotnetChannelObserver");
const DotnetLoggerObserver_1 = require("./observers/DotnetLoggerObserver");
const EventStream_1 = require("./EventStream");
const InformationMessageObserver_1 = require("./observers/InformationMessageObserver");
const OmnisharpChannelObserver_1 = require("./observers/OmnisharpChannelObserver");
const OmnisharpDebugModeLoggerObserver_1 = require("./observers/OmnisharpDebugModeLoggerObserver");
const OmnisharpLoggerObserver_1 = require("./observers/OmnisharpLoggerObserver");
const OmnisharpStatusBarObserver_1 = require("./observers/OmnisharpStatusBarObserver");
const platform_1 = require("./platform");
const statusBarItemAdapter_1 = require("./statusBarItemAdapter");
// import { TelemetryObserver } from './observers/TelemetryObserver';
// import TelemetryReporter from 'vscode-extension-telemetry';
const jsonContributions_1 = require("./features/json/jsonContributions");
const ProjectStatusBarObserver_1 = require("./observers/ProjectStatusBarObserver");
const NetworkSettings_1 = require("./NetworkSettings");
const ErrorMessageObserver_1 = require("./observers/ErrorMessageObserver");
const OptionProvider_1 = require("./observers/OptionProvider");
const DotnetTestChannelObserver_1 = require("./observers/DotnetTestChannelObserver");
const DotnetTestLoggerObserver_1 = require("./observers/DotnetTestLoggerObserver");
const OptionChangeObserver_1 = require("./observers/OptionChangeObserver");
const CreateOptionStream_1 = require("./observables/CreateOptionStream");
const CSharpExtensionId_1 = require("./constants/CSharpExtensionId");
const OpenURLObserver_1 = require("./observers/OpenURLObserver");
const razor_1 = require("./razor/razor");
const RazorLoggerObserver_1 = require("./observers/RazorLoggerObserver");
const downloadAndInstallPackages_1 = require("./packageManager/downloadAndInstallPackages");
const InstallRuntimeDependencies_1 = require("./InstallRuntimeDependencies");
const isValidDownload_1 = require("./packageManager/isValidDownload");
const BackgroundWorkStatusBarObserver_1 = require("./observers/BackgroundWorkStatusBarObserver");
const decompilationPrompt_1 = require("./omnisharp/decompilationPrompt");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionId = CSharpExtensionId_1.CSharpExtensionId;
        const extension = vscode.extensions.getExtension(extensionId);
        util.setExtensionPath(extension.extensionPath);
        const eventStream = new EventStream_1.EventStream();
        const optionStream = CreateOptionStream_1.default(vscode);
        let optionProvider = new OptionProvider_1.default(optionStream);
        let dotnetChannel = vscode.window.createOutputChannel('.NET');
        let dotnetChannelObserver = new DotnetChannelObserver_1.DotNetChannelObserver(dotnetChannel);
        let dotnetLoggerObserver = new DotnetLoggerObserver_1.DotnetLoggerObserver(dotnetChannel);
        eventStream.subscribe(dotnetChannelObserver.post);
        eventStream.subscribe(dotnetLoggerObserver.post);
        let dotnetTestChannel = vscode.window.createOutputChannel(".NET Test Log");
        let dotnetTestChannelObserver = new DotnetTestChannelObserver_1.default(dotnetTestChannel);
        let dotnetTestLoggerObserver = new DotnetTestLoggerObserver_1.default(dotnetTestChannel);
        eventStream.subscribe(dotnetTestChannelObserver.post);
        eventStream.subscribe(dotnetTestLoggerObserver.post);
        let csharpChannel = vscode.window.createOutputChannel('C#');
        let csharpchannelObserver = new CsharpChannelObserver_1.CsharpChannelObserver(csharpChannel);
        let csharpLogObserver = new CsharpLoggerObserver_1.CsharpLoggerObserver(csharpChannel);
        eventStream.subscribe(csharpchannelObserver.post);
        eventStream.subscribe(csharpLogObserver.post);
        let omnisharpChannel = vscode.window.createOutputChannel('OmniSharp Log');
        let omnisharpLogObserver = new OmnisharpLoggerObserver_1.OmnisharpLoggerObserver(omnisharpChannel);
        let omnisharpChannelObserver = new OmnisharpChannelObserver_1.OmnisharpChannelObserver(omnisharpChannel, vscode);
        eventStream.subscribe(omnisharpLogObserver.post);
        eventStream.subscribe(omnisharpChannelObserver.post);
        let warningMessageObserver = new WarningMessageObserver_1.WarningMessageObserver(vscode, () => optionProvider.GetLatestOptions().disableMSBuildDiagnosticWarning || false);
        eventStream.subscribe(warningMessageObserver.post);
        let informationMessageObserver = new InformationMessageObserver_1.InformationMessageObserver(vscode);
        eventStream.subscribe(informationMessageObserver.post);
        let errorMessageObserver = new ErrorMessageObserver_1.ErrorMessageObserver(vscode);
        eventStream.subscribe(errorMessageObserver.post);
        let omnisharpStatusBar = new statusBarItemAdapter_1.StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE + 2));
        let omnisharpStatusBarObserver = new OmnisharpStatusBarObserver_1.OmnisharpStatusBarObserver(omnisharpStatusBar);
        eventStream.subscribe(omnisharpStatusBarObserver.post);
        let projectStatusBar = new statusBarItemAdapter_1.StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE + 1));
        let projectStatusBarObserver = new ProjectStatusBarObserver_1.ProjectStatusBarObserver(projectStatusBar);
        eventStream.subscribe(projectStatusBarObserver.post);
        let backgroundWorkStatusBar = new statusBarItemAdapter_1.StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE));
        let backgroundWorkStatusBarObserver = new BackgroundWorkStatusBarObserver_1.BackgroundWorkStatusBarObserver(backgroundWorkStatusBar);
        eventStream.subscribe(backgroundWorkStatusBarObserver.post);
        let openURLObserver = new OpenURLObserver_1.OpenURLObserver(vscode);
        eventStream.subscribe(openURLObserver.post);
        const debugMode = false;
        if (debugMode) {
            let omnisharpDebugModeLoggerObserver = new OmnisharpDebugModeLoggerObserver_1.OmnisharpDebugModeLoggerObserver(omnisharpChannel);
            eventStream.subscribe(omnisharpDebugModeLoggerObserver.post);
        }
        let platformInfo;
        try {
            platformInfo = yield platform_1.PlatformInformation.GetCurrent();
        }
        catch (error) {
            eventStream.post(new loggingEvents_1.ActivationFailure());
        }
        if (!isSupportedPlatform(platformInfo)) {
            const platform = platformInfo.platform ? platformInfo.platform : "this platform";
            const architecture = platformInfo.architecture ? platformInfo.architecture : " and <unknown processor architecture>";
            let errorMessage = `The C# extension for Visual Studio Code (powered by OmniSharp) is incompatible on ${platform} ${architecture}`;
            const messageOptions = {};
            // Check to see if VS Code is running remotely
            if (extension.extensionKind === vscode.ExtensionKind.Workspace) {
                const setupButton = "How to setup Remote Debugging";
                errorMessage += ` with the VS Code Remote Extensions. To see avaliable workarounds, click on '${setupButton}'.`;
                yield vscode.window.showErrorMessage(errorMessage, messageOptions, setupButton).then((selectedItem) => {
                    if (selectedItem === setupButton) {
                        let remoteDebugInfoURL = 'https://github.com/OmniSharp/omnisharp-vscode/wiki/Remote-Debugging-On-Linux-Arm';
                        vscode.env.openExternal(vscode.Uri.parse(remoteDebugInfoURL));
                    }
                });
            }
            else {
                yield vscode.window.showErrorMessage(errorMessage, messageOptions);
            }
            // Unsupported platform
            return null;
        }
        // let telemetryObserver = new TelemetryObserver(platformInfo, () => reporter);
        // eventStream.subscribe(telemetryObserver.post);
        let networkSettingsProvider = NetworkSettings_1.vscodeNetworkSettingsProvider(vscode);
        let installDependencies = (dependencies) => __awaiter(this, void 0, void 0, function* () { return downloadAndInstallPackages_1.downloadAndInstallPackages(dependencies, networkSettingsProvider, eventStream, isValidDownload_1.isValidDownload); });
        let runtimeDependenciesExist = yield ensureRuntimeDependencies(extension, eventStream, platformInfo, installDependencies);
        // Prompt to authorize decompilation in this workspace
        yield decompilationPrompt_1.getDecompilationAuthorization(context, optionProvider);
        // activate language services
        let langServicePromise = OmniSharp.activate(context, extension.packageJSON, platformInfo, networkSettingsProvider, eventStream, optionProvider, extension.extensionPath);
        // register JSON completion & hover providers for project.json
        context.subscriptions.push(jsonContributions_1.addJSONProviders());
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            eventStream.post(new loggingEvents_1.ActiveTextEditorChanged());
        }));
        context.subscriptions.push(optionProvider);
        context.subscriptions.push(OptionChangeObserver_1.ShowOmniSharpConfigChangePrompt(optionStream, vscode));
        let coreClrDebugPromise = Promise.resolve();
        if (runtimeDependenciesExist) {
            // activate coreclr-debug
            coreClrDebugPromise = coreclrdebug.activate(extension, context, platformInfo, eventStream);
        }
        let razorPromise = Promise.resolve();
        if (!optionProvider.GetLatestOptions().razorDisabled) {
            const razorObserver = new RazorLoggerObserver_1.RazorLoggerObserver(omnisharpChannel);
            eventStream.subscribe(razorObserver.post);
            if (!optionProvider.GetLatestOptions().razorDevMode) {
                razorPromise = razor_1.activateRazorExtension(context, extension.extensionPath, eventStream);
            }
        }
        return {
            initializationFinished: () => __awaiter(this, void 0, void 0, function* () {
                let langService = yield langServicePromise;
                yield langService.server.waitForEmptyEventQueue();
                yield coreClrDebugPromise;
                yield razorPromise;
            }),
            getAdvisor: () => __awaiter(this, void 0, void 0, function* () {
                let langService = yield langServicePromise;
                return langService.advisor;
            }),
            getTestManager: () => __awaiter(this, void 0, void 0, function* () {
                let langService = yield langServicePromise;
                return langService.testManager;
            }),
            eventStream
        };
    });
}
exports.activate = activate;
function isSupportedPlatform(platform) {
    if (platform.isWindows()) {
        return platform.architecture === "x86" || platform.architecture === "x86_64" || platform.architecture === "arm64";
    }
    if (platform.isMacOS()) {
        return true;
    }
    if (platform.isLinux()) {
        return platform.architecture === "x86_64" ||
            platform.architecture === "x86" ||
            platform.architecture === "i686";
    }
    return false;
}
function ensureRuntimeDependencies(extension, eventStream, platformInfo, installDependencies) {
    return __awaiter(this, void 0, void 0, function* () {
        return InstallRuntimeDependencies_1.installRuntimeDependencies(extension.packageJSON, extension.extensionPath, installDependencies, eventStream, platformInfo);
    });
}
//# sourceMappingURL=main.js.map