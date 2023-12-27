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
const net = require("net");
const os = require("os");
const path = require("path");
const serverUtils = require("../omnisharp/utils");
const utils = require("../common");
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const debuggerEventsProtocol_1 = require("../coreclr-debug/debuggerEventsProtocol");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const Disposable_1 = require("../Disposable");
const CompositeDisposable_1 = require("../CompositeDisposable");
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
class TestManager extends abstractProvider_1.default {
    constructor(server, eventStream, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this._telemetryIntervalId = undefined;
        this._eventStream = eventStream;
        // register commands
        let d1 = vscode.commands.registerCommand('dotnet.test.run', (testMethod, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this.runDotnetTest(testMethod, fileName, testFrameworkName); }));
        let d2 = vscode.commands.registerCommand('dotnet.test.debug', (testMethod, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this.debugDotnetTest(testMethod, fileName, testFrameworkName); }));
        let d4 = vscode.commands.registerCommand('dotnet.classTests.run', (className, methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this.runDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName); }));
        let d5 = vscode.commands.registerCommand('dotnet.classTests.debug', (className, methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this.debugDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName); }));
        let d6 = vscode.commands.registerTextEditorCommand('dotnet.test.runTestsInContext', (textEditor) => __awaiter(this, void 0, void 0, function* () { return this._runDotnetTestsInContext(textEditor.document.fileName, textEditor.selection.active, textEditor.document.languageId); }));
        let d7 = vscode.commands.registerTextEditorCommand('dotnet.test.debugTestsInContext', (textEditor) => __awaiter(this, void 0, void 0, function* () { return this._debugDotnetTestsInContext(textEditor.document.fileName, textEditor.document.uri, textEditor.selection.active, textEditor.document.languageId); }));
        this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
        let d3 = new Disposable_1.default(() => {
            if (this._telemetryIntervalId !== undefined) {
                // Stop reporting telemetry
                clearInterval(this._telemetryIntervalId);
                this._telemetryIntervalId = undefined;
                this._reportTelemetry();
            }
        });
        this.addDisposables(new CompositeDisposable_1.default(d1, d2, d3, d4, d5, d6, d7));
    }
    _recordRunRequest(testFrameworkName) {
        if (this._runCounts === undefined) {
            this._runCounts = {};
        }
        if (testFrameworkName === undefined) {
            testFrameworkName = 'context';
        }
        let count = this._runCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._runCounts[testFrameworkName] = count;
    }
    _recordDebugRequest(testFrameworkName) {
        if (this._debugCounts === undefined) {
            this._debugCounts = {};
        }
        if (testFrameworkName === undefined) {
            testFrameworkName = 'context';
        }
        let count = this._debugCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._debugCounts[testFrameworkName] = count;
    }
    _reportTelemetry() {
        this._eventStream.post(new loggingEvents_1.TestExecutionCountReport(this._debugCounts, this._runCounts));
        this._runCounts = undefined;
        this._debugCounts = undefined;
    }
    _saveDirtyFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(vscode.workspace.saveAll(/*includeUntitled*/ false));
        });
    }
    _runTest(fileName, testMethod, runSettings, testFrameworkName, targetFrameworkVersion, noBuild) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                RunSettings: runSettings,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                NoBuild: noBuild
            };
            try {
                let response = yield serverUtils.runTest(this._server, request);
                return response.Results;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    _recordRunAndGetFrameworkVersion(fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordRunRequest(testFrameworkName);
            let projectInfo;
            try {
                projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            }
            catch (error) {
                return undefined;
            }
            let targetFrameworkVersion;
            if (projectInfo.MsBuildProject) {
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
            }
            else {
                throw new Error('Expected project.json or .csproj project.');
            }
            return targetFrameworkVersion;
        });
    }
    discoverTests(fileName, testFrameworkName, noBuild) {
        return __awaiter(this, void 0, void 0, function* () {
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            let runSettings = vscode.workspace.getConfiguration('omnisharp').get('testRunSettings');
            const request = {
                FileName: fileName,
                RunSettings: runSettings,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                NoBuild: noBuild
            };
            try {
                let response = yield serverUtils.discoverTests(this._server, request);
                return response.Tests;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    _getRunSettings() {
        return vscode.workspace.getConfiguration('omnisharp').get('testRunSettings');
    }
    runDotnetTest(testMethod, fileName, testFrameworkName, noBuild = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this._eventStream.post(new loggingEvents_1.DotNetTestRunStart(testMethod));
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            let runSettings = this._getRunSettings();
            try {
                let results = yield this._runTest(fileName, testMethod, runSettings, testFrameworkName, targetFrameworkVersion, noBuild);
                this._eventStream.post(new loggingEvents_1.ReportDotNetTestResults(results));
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
            }
            finally {
                listener.dispose();
            }
        });
    }
    runDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName, noBuild = false) {
        return __awaiter(this, void 0, void 0, function* () {
            //to do: try to get the class name here
            this._eventStream.post(new loggingEvents_1.DotNetTestsInClassRunStart(className));
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            let runSettings = this._getRunSettings();
            try {
                let results = yield this._runTestsInClass(fileName, runSettings, testFrameworkName, targetFrameworkVersion, methodsInClass, noBuild);
                this._eventStream.post(new loggingEvents_1.ReportDotNetTestResults(results));
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
            }
            finally {
                listener.dispose();
            }
        });
    }
    _runTestsInClass(fileName, runSettings, testFrameworkName, targetFrameworkVersion, methodsToRun, noBuild) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: fileName,
                RunSettings: runSettings,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                MethodNames: methodsToRun,
                NoBuild: noBuild
            };
            let response = yield serverUtils.runTestsInClass(this._server, request);
            return response.Results;
        });
    }
    _runDotnetTestsInContext(fileName, active, editorLangId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (editorLangId !== "csharp") {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(`${vscode.workspace.asRelativePath(fileName, false)} is not a C# file, cannot run tests`));
                return;
            }
            this._eventStream.post(new loggingEvents_1.DotNetTestRunInContextStart(vscode.workspace.asRelativePath(fileName, false), active.line, active.character));
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName);
            let runSettings = this._getRunSettings();
            const request = {
                FileName: fileName,
                Line: active.line,
                Column: active.character,
                RunSettings: runSettings,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            try {
                let response = yield serverUtils.runTestsInContext(this._server, request);
                if (response.ContextHadNoTests) {
                    this._eventStream.post(new loggingEvents_1.DotNetTestMessage(response.Failure));
                }
                else if (!response.Pass && response.Results === null) {
                    this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(response.Failure));
                }
                else {
                    this._eventStream.post(new loggingEvents_1.ReportDotNetTestResults(response.Results));
                }
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
            }
            finally {
                listener.dispose();
            }
        });
    }
    _createLaunchConfiguration(program, args, cwd, debuggerEventsPipeName) {
        let debugOptions = vscode.workspace.getConfiguration('csharp').get('unitTestDebuggingOptions');
        // Get the initial set of options from the workspace setting
        let result;
        if (typeof debugOptions === "object") {
            // clone the options object to avoid changing it
            result = JSON.parse(JSON.stringify(debugOptions));
        }
        else {
            result = {};
        }
        let launchConfiguration = Object.assign(Object.assign({}, result), { type: result.type || "coreclr", name: ".NET Test Launch", request: "launch", debuggerEventsPipeName: debuggerEventsPipeName, program: program, args: args, cwd: cwd });
        // Now fill in the rest of the options
        return launchConfiguration;
    }
    _getLaunchConfigurationForVSTest(fileName, testMethod, runSettings, testFrameworkName, targetFrameworkVersion, debugEventListener, noBuild) {
        return __awaiter(this, void 0, void 0, function* () {
            // Listen for test messages while getting start info.
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                RunSettings: runSettings,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                NoBuild: noBuild
            };
            try {
                let response = yield serverUtils.debugTestGetStartInfo(this._server, request);
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            }
            finally {
                listener.dispose();
            }
        });
    }
    _recordDebugAndGetDebugValues(fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordDebugRequest(testFrameworkName);
            let projectInfo;
            try {
                projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            }
            catch (error) {
                return undefined;
            }
            let debugEventListener = null;
            let targetFrameworkVersion;
            if (projectInfo.MsBuildProject) {
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
                debugEventListener = new DebugEventListener(fileName, this._server, this._eventStream);
                debugEventListener.start();
            }
            else {
                throw new Error('Expected .csproj project.');
            }
            return { debugEventListener, targetFrameworkVersion };
        });
    }
    debugDotnetTest(testMethod, fileName, testFrameworkName, noBuild = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // We support to styles of 'dotnet test' for debugging: The legacy 'project.json' testing, and the newer csproj support
            // using VS Test. These require a different level of communication.
            this._eventStream.post(new loggingEvents_1.DotNetTestDebugStart(testMethod));
            let { debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName);
            let runSettings = this._getRunSettings();
            try {
                let config = yield this._getLaunchConfigurationForVSTest(fileName, testMethod, runSettings, testFrameworkName, targetFrameworkVersion, debugEventListener, noBuild);
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestDebugStartFailure(reason));
                if (debugEventListener !== null) {
                    debugEventListener.close();
                }
            }
        });
    }
    debugDotnetTestsInClass(className, methodsToRun, fileName, testFrameworkName, noBuild = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this._eventStream.post(new loggingEvents_1.DotNetTestsInClassDebugStart(className));
            let { debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName);
            let runSettings = this._getRunSettings();
            try {
                let config = yield this._getLaunchConfigurationForVSTestClass(fileName, methodsToRun, runSettings, testFrameworkName, targetFrameworkVersion, debugEventListener, noBuild);
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestDebugStartFailure(reason));
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            }
        });
    }
    _debugDotnetTestsInContext(fileName, fileUri, active, editorLangId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (editorLangId !== "csharp") {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(`${vscode.workspace.asRelativePath(fileName, false)} is not a C# file, cannot run tests`));
                return;
            }
            this._eventStream.post(new loggingEvents_1.DotNetTestDebugInContextStart(vscode.workspace.asRelativePath(fileName, false), active.line, active.character));
            let { debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName);
            let runSettings = this._getRunSettings();
            try {
                let config = yield this._getLaunchConfigurationForVSTestInContext(fileName, active.line, active.character, runSettings, targetFrameworkVersion, debugEventListener);
                if (config === null) {
                    return;
                }
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
                return vscode.debug.startDebugging(workspaceFolder, config);
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
                if (debugEventListener !== null) {
                    debugEventListener.close();
                }
            }
        });
    }
    _getLaunchConfigurationForVSTestClass(fileName, methodsToRun, runSettings, testFrameworkName, targetFrameworkVersion, debugEventListener, noBuild) {
        return __awaiter(this, void 0, void 0, function* () {
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                MethodNames: methodsToRun,
                RunSettings: runSettings,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                NoBuild: noBuild
            };
            try {
                let response = yield serverUtils.debugTestClassGetStartInfo(this._server, request);
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            }
            finally {
                listener.dispose();
            }
        });
    }
    _getLaunchConfigurationForVSTestInContext(fileName, line, column, runSettings, targetFrameworkVersion, debugEventListener) {
        return __awaiter(this, void 0, void 0, function* () {
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                Line: line,
                Column: column,
                RunSettings: runSettings,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            try {
                let response = yield serverUtils.debugTestsInContextGetStartInfo(this._server, request);
                if (!response.Succeeded) {
                    if (response.ContextHadNoTests) {
                        this._eventStream.post(new loggingEvents_1.DotNetTestMessage(response.FailureReason));
                    }
                    else {
                        this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(response.FailureReason));
                    }
                    return null;
                }
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            }
            finally {
                listener.dispose();
            }
        });
    }
}
exports.default = TestManager;
class DebugEventListener {
    constructor(fileName, server, eventStream) {
        this._isClosed = false;
        this._fileName = fileName;
        this._server = server;
        this._eventStream = eventStream;
        // NOTE: The max pipe name on OSX is fairly small, so this name shouldn't bee too long.
        const pipeSuffix = "TestDebugEvents-" + process.pid;
        if (os.platform() === 'win32') {
            this._pipePath = "\\\\.\\pipe\\Microsoft.VSCode.CSharpExt." + pipeSuffix;
        }
        else {
            this._pipePath = path.join(utils.getExtensionPath(), "." + pipeSuffix);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // We use our process id as part of the pipe name, so if we still somehow have an old instance running, close it.
            if (DebugEventListener.s_activeInstance !== null) {
                DebugEventListener.s_activeInstance.close();
            }
            DebugEventListener.s_activeInstance = this;
            this._serverSocket = net.createServer((socket) => {
                socket.on('data', (buffer) => {
                    let event;
                    try {
                        event = debuggerEventsProtocol_1.DebuggerEventsProtocol.decodePacket(buffer);
                    }
                    catch (e) {
                        this._eventStream.post(new loggingEvents_1.DotNetTestDebugWarning("Invalid event received from debugger"));
                        return;
                    }
                    switch (event.eventType) {
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.ProcessLaunched:
                            let processLaunchedEvent = (event);
                            this._eventStream.post(new loggingEvents_1.DotNetTestDebugProcessStart(processLaunchedEvent.targetProcessId));
                            this.onProcessLaunched(processLaunchedEvent.targetProcessId);
                            break;
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.DebuggingStopped:
                            this._eventStream.post(new loggingEvents_1.DotNetTestDebugComplete());
                            this.onDebuggingStopped();
                            break;
                    }
                });
                socket.on('end', () => {
                    this.onDebuggingStopped();
                });
            });
            yield this.removeSocketFileIfExists();
            return new Promise((resolve, reject) => {
                let isStarted = false;
                this._serverSocket.on('error', (err) => {
                    if (!isStarted) {
                        reject(err.message);
                    }
                    else {
                        this._eventStream.post(new loggingEvents_1.DotNetTestDebugWarning(`Communications error on debugger event channel. ${err.message}`));
                    }
                });
                this._serverSocket.listen(this._pipePath, () => {
                    isStarted = true;
                    resolve();
                });
            });
        });
    }
    pipePath() {
        return this._pipePath;
    }
    close() {
        if (this === DebugEventListener.s_activeInstance) {
            DebugEventListener.s_activeInstance = null;
        }
        if (this._isClosed) {
            return;
        }
        this._isClosed = true;
        if (this._serverSocket !== null) {
            this._serverSocket.close();
        }
    }
    onProcessLaunched(targetProcessId) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: this._fileName,
                TargetProcessId: targetProcessId
            };
            const disposable = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            try {
                yield serverUtils.debugTestLaunch(this._server, request);
            }
            finally {
                disposable.dispose();
            }
        });
    }
    onDebuggingStopped() {
        if (this._isClosed) {
            return;
        }
        let request = {
            FileName: this._fileName
        };
        try {
            serverUtils.debugTestStop(this._server, request);
            this.close();
        }
        catch (error) {
            return;
        }
    }
    removeSocketFileIfExists() {
        return __awaiter(this, void 0, void 0, function* () {
            if (os.platform() === 'win32') {
                // Win32 doesn't use the file system for pipe names
                return Promise.resolve();
            }
            else {
                return utils.deleteIfExists(this._pipePath);
            }
        });
    }
}
DebugEventListener.s_activeInstance = null;
//# sourceMappingURL=dotnetTest.js.map