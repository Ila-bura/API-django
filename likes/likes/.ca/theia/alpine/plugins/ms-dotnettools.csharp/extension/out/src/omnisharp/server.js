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
exports.OmniSharpServer = void 0;
const fs = require("fs");
const path = require("path");
const utils = require("../common");
const serverUtils = require("../omnisharp/utils");
const child_process_1 = require("child_process");
const launcher_1 = require("./launcher");
const readline_1 = require("readline");
const requestQueue_1 = require("./requestQueue");
const delayTracker_1 = require("./delayTracker");
const events_1 = require("events");
const OmnisharpManager_1 = require("./OmnisharpManager");
const launcher_2 = require("./launcher");
const timers_1 = require("timers");
const OmnisharpDownloader_1 = require("./OmnisharpDownloader");
const ObservableEvents = require("./loggingEvents");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const CompositeDisposable_1 = require("../CompositeDisposable");
const Disposable_1 = require("../Disposable");
const removeBOM_1 = require("../utils/removeBOM");
var ServerState;
(function (ServerState) {
    ServerState[ServerState["Starting"] = 0] = "Starting";
    ServerState[ServerState["Started"] = 1] = "Started";
    ServerState[ServerState["Stopped"] = 2] = "Stopped";
})(ServerState || (ServerState = {}));
var Events;
(function (Events) {
    Events.StateChanged = 'stateChanged';
    Events.StdOut = 'stdout';
    Events.StdErr = 'stderr';
    Events.Error = 'Error';
    Events.ServerError = 'ServerError';
    Events.UnresolvedDependencies = 'UnresolvedDependencies';
    Events.PackageRestoreStarted = 'PackageRestoreStarted';
    Events.PackageRestoreFinished = 'PackageRestoreFinished';
    Events.ProjectChanged = 'ProjectChanged';
    Events.ProjectAdded = 'ProjectAdded';
    Events.ProjectRemoved = 'ProjectRemoved';
    Events.ProjectDiagnosticStatus = 'ProjectDiagnosticStatus';
    Events.MsBuildProjectDiagnostics = 'MsBuildProjectDiagnostics';
    Events.TestMessage = 'TestMessage';
    Events.BeforeServerInstall = 'BeforeServerInstall';
    Events.BeforeServerStart = 'BeforeServerStart';
    Events.ServerStart = 'ServerStart';
    Events.ServerStop = 'ServerStop';
    Events.MultipleLaunchTargets = 'server:MultipleLaunchTargets';
    Events.Started = 'started';
    Events.ProjectConfiguration = 'ProjectConfiguration';
})(Events || (Events = {}));
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
const serverUrl = "https://roslynomnisharp.blob.core.windows.net";
const installPath = ".omnisharp";
const latestVersionFileServerPath = 'releases/versioninfo.txt';
class OmniSharpServer {
    constructor(vscode, networkSettingsProvider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath, monoResolver, decompilationAuthorized) {
        this.vscode = vscode;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.eventStream = eventStream;
        this.optionProvider = optionProvider;
        this.extensionPath = extensionPath;
        this.monoResolver = monoResolver;
        this.decompilationAuthorized = decompilationAuthorized;
        this._telemetryIntervalId = undefined;
        this._eventBus = new events_1.EventEmitter();
        this._state = ServerState.Stopped;
        this._sessionProperties = {};
        this.updateProjectDebouncer = new rxjs_1.Subject();
        this.debounceUpdateProjectWithLeadingTrue = () => {
            // Call the updateProjectInfo directly if it is the first time, otherwise debounce the request
            // This needs to be done so that we have a project information for the first incoming request
            if (this.firstUpdateProject) {
                this.updateProjectInfo();
            }
            else {
                this.updateProjectDebouncer.next(new ObservableEvents.ProjectModified());
            }
        };
        this.updateProjectInfo = () => __awaiter(this, void 0, void 0, function* () {
            this.firstUpdateProject = false;
            let info = yield serverUtils.requestWorkspaceInformation(this);
            //once we get the info, push the event into the event stream
            this.eventStream.post(new ObservableEvents.WorkspaceInformationUpdated(info));
        });
        this._requestQueue = new requestQueue_1.RequestQueueCollection(this.eventStream, 8, request => this._makeRequest(request));
        let downloader = new OmnisharpDownloader_1.OmnisharpDownloader(networkSettingsProvider, this.eventStream, this.packageJSON, platformInfo, extensionPath);
        this._omnisharpManager = new OmnisharpManager_1.OmnisharpManager(downloader, platformInfo);
        this.updateProjectDebouncer.pipe(operators_1.debounceTime(1500)).subscribe((event) => { this.updateProjectInfo(); });
        this.firstUpdateProject = true;
    }
    get sessionProperties() {
        return this._sessionProperties;
    }
    isRunning() {
        return this._state === ServerState.Started;
    }
    waitForEmptyEventQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this._requestQueue.isEmpty()) {
                let p = new Promise((resolve) => timers_1.setTimeout(resolve, 100));
                yield p;
            }
        });
    }
    _setState(value) {
        if (typeof value !== 'undefined' && value !== this._state) {
            this._state = value;
            this._fireEvent(Events.StateChanged, this._state);
        }
    }
    _recordRequestDelay(requestName, elapsedTime) {
        let tracker = this._delayTrackers[requestName];
        if (!tracker) {
            tracker = new delayTracker_1.DelayTracker(requestName);
            this._delayTrackers[requestName] = tracker;
        }
        tracker.reportDelay(elapsedTime);
    }
    _reportTelemetry() {
        const delayTrackers = this._delayTrackers;
        for (const requestName in delayTrackers) {
            const tracker = delayTrackers[requestName];
            const eventName = 'omnisharp' + requestName;
            if (tracker.hasMeasures()) {
                const measures = tracker.getMeasures();
                tracker.clearMeasures();
                this.eventStream.post(new ObservableEvents.OmnisharpDelayTrackerEventMeasures(eventName, measures));
            }
        }
    }
    getSolutionPathOrFolder() {
        return this._launchTarget
            ? this._launchTarget.target
            : undefined;
    }
    // --- eventing
    onStdout(listener, thisArg) {
        return this._addListener(Events.StdOut, listener, thisArg);
    }
    onStderr(listener, thisArg) {
        return this._addListener(Events.StdErr, listener, thisArg);
    }
    onError(listener, thisArg) {
        return this._addListener(Events.Error, listener, thisArg);
    }
    onServerError(listener, thisArg) {
        return this._addListener(Events.ServerError, listener, thisArg);
    }
    onUnresolvedDependencies(listener, thisArg) {
        return this._addListener(Events.UnresolvedDependencies, listener, thisArg);
    }
    onBeforePackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreStarted, listener, thisArg);
    }
    onPackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreFinished, listener, thisArg);
    }
    onProjectChange(listener, thisArg) {
        return this._addListener(Events.ProjectChanged, listener, thisArg);
    }
    onProjectAdded(listener, thisArg) {
        return this._addListener(Events.ProjectAdded, listener, thisArg);
    }
    onProjectRemoved(listener, thisArg) {
        return this._addListener(Events.ProjectRemoved, listener, thisArg);
    }
    onProjectDiagnosticStatus(listener, thisArg) {
        return this._addListener(Events.ProjectDiagnosticStatus, listener, thisArg);
    }
    onMsBuildProjectDiagnostics(listener, thisArg) {
        return this._addListener(Events.MsBuildProjectDiagnostics, listener, thisArg);
    }
    onTestMessage(listener, thisArg) {
        return this._addListener(Events.TestMessage, listener, thisArg);
    }
    onBeforeServerInstall(listener) {
        return this._addListener(Events.BeforeServerInstall, listener);
    }
    onBeforeServerStart(listener) {
        return this._addListener(Events.BeforeServerStart, listener);
    }
    onServerStart(listener) {
        return this._addListener(Events.ServerStart, listener);
    }
    onServerStop(listener) {
        return this._addListener(Events.ServerStop, listener);
    }
    onMultipleLaunchTargets(listener, thisArg) {
        return this._addListener(Events.MultipleLaunchTargets, listener, thisArg);
    }
    onOmnisharpStart(listener) {
        return this._addListener(Events.Started, listener);
    }
    _addListener(event, listener, thisArg) {
        listener = thisArg ? listener.bind(thisArg) : listener;
        this._eventBus.addListener(event, listener);
        return new Disposable_1.default(() => this._eventBus.removeListener(event, listener));
    }
    _fireEvent(event, args) {
        this._eventBus.emit(event, args);
    }
    // --- start, stop, and connect
    _start(launchTarget, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (launchTarget.kind === launcher_1.LaunchTargetKind.LiveShare) {
                this.eventStream.post(new ObservableEvents.OmnisharpServerMessage("During Live Share sessions language services are provided by the Live Share server."));
                return;
            }
            let disposables = new CompositeDisposable_1.default();
            disposables.add(this.onServerError(err => this.eventStream.post(new ObservableEvents.OmnisharpServerOnServerError(err))));
            disposables.add(this.onError((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerOnError(message))));
            disposables.add(this.onMsBuildProjectDiagnostics((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerMsBuildProjectDiagnostics(message))));
            disposables.add(this.onUnresolvedDependencies((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerUnresolvedDependencies(message))));
            disposables.add(this.onStderr((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerOnStdErr(message))));
            disposables.add(this.onMultipleLaunchTargets((targets) => this.eventStream.post(new ObservableEvents.OmnisharpOnMultipleLaunchTargets(targets))));
            disposables.add(this.onBeforeServerInstall(() => this.eventStream.post(new ObservableEvents.OmnisharpOnBeforeServerInstall())));
            disposables.add(this.onBeforeServerStart(() => {
                this.eventStream.post(new ObservableEvents.OmnisharpOnBeforeServerStart());
            }));
            disposables.add(this.onServerStop(() => this.eventStream.post(new ObservableEvents.OmnisharpServerOnStop())));
            disposables.add(this.onServerStart(() => {
                this.eventStream.post(new ObservableEvents.OmnisharpServerOnStart());
            }));
            disposables.add(this.onProjectDiagnosticStatus((message) => this.eventStream.post(new ObservableEvents.OmnisharpProjectDiagnosticStatus(message))));
            disposables.add(this.onProjectConfigurationReceived((message) => {
                this.eventStream.post(new ObservableEvents.ProjectConfiguration(message));
            }));
            disposables.add(this.onProjectAdded(this.debounceUpdateProjectWithLeadingTrue));
            disposables.add(this.onProjectChange(this.debounceUpdateProjectWithLeadingTrue));
            disposables.add(this.onProjectRemoved(this.debounceUpdateProjectWithLeadingTrue));
            this._disposables = disposables;
            this._setState(ServerState.Starting);
            this._launchTarget = launchTarget;
            const solutionPath = launchTarget.target;
            const cwd = path.dirname(solutionPath);
            let args = [
                '-z',
                '-s', solutionPath,
                '--hostPID', process.pid.toString(),
                'DotNet:enablePackageRestore=false',
                '--encoding', 'utf-8',
                '--loglevel', options.loggingLevel
            ];
            let razorPluginPath;
            if (!options.razorDisabled) {
                // Razor support only exists for certain platforms, so only load the plugin if present
                razorPluginPath = options.razorPluginPath || path.join(this.extensionPath, '.razor', 'OmniSharpPlugin', 'Microsoft.AspNetCore.Razor.OmniSharpPlugin.dll');
                if (fs.existsSync(razorPluginPath)) {
                    args.push('--plugin', razorPluginPath);
                }
            }
            if (options.waitForDebugger === true) {
                args.push('--debug');
            }
            for (let i = 0; i < options.excludePaths.length; i++) {
                args.push(`FileOptions:SystemExcludeSearchPatterns:${i}=${options.excludePaths[i]}`);
            }
            if (options.enableMsBuildLoadProjectsOnDemand === true) {
                args.push('MsBuild:LoadProjectsOnDemand=true');
            }
            if (options.enableRoslynAnalyzers === true) {
                args.push('RoslynExtensionsOptions:EnableAnalyzersSupport=true');
            }
            if (options.enableEditorConfigSupport === true) {
                args.push('FormattingOptions:EnableEditorConfigSupport=true');
            }
            if (options.organizeImportsOnFormat === true) {
                args.push('FormattingOptions:OrganizeImports=true');
            }
            if (this.decompilationAuthorized && options.enableDecompilationSupport === true) {
                args.push('RoslynExtensionsOptions:EnableDecompilationSupport=true');
            }
            if (options.enableImportCompletion === true) {
                args.push('RoslynExtensionsOptions:EnableImportCompletion=true');
            }
            if (options.enableAsyncCompletion === true) {
                args.push('RoslynExtensionsOptions:EnableAsyncCompletion=true');
            }
            let launchInfo;
            try {
                launchInfo = yield this._omnisharpManager.GetOmniSharpLaunchInfo(this.packageJSON.defaults.omniSharp, options.path, serverUrl, latestVersionFileServerPath, installPath, this.extensionPath);
            }
            catch (error) {
                this.eventStream.post(new ObservableEvents.OmnisharpFailure(`Error occurred in loading omnisharp from omnisharp.path\nCould not start the server due to ${error.toString()}`, error));
                return;
            }
            this.eventStream.post(new ObservableEvents.OmnisharpInitialisation(new Date(), solutionPath));
            this._fireEvent(Events.BeforeServerStart, solutionPath);
            try {
                let launchResult = yield launcher_2.launchOmniSharp(cwd, args, launchInfo, this.platformInfo, options, this.monoResolver);
                this.eventStream.post(new ObservableEvents.OmnisharpLaunch(launchResult.monoVersion, launchResult.monoPath, launchResult.command, launchResult.process.pid));
                if (razorPluginPath && options.razorPluginPath) {
                    if (fs.existsSync(razorPluginPath)) {
                        this.eventStream.post(new ObservableEvents.RazorPluginPathSpecified(razorPluginPath));
                    }
                    else {
                        this.eventStream.post(new ObservableEvents.RazorPluginPathDoesNotExist(razorPluginPath));
                    }
                }
                this._serverProcess = launchResult.process;
                this._delayTrackers = {};
                yield this._doConnect(options);
                this._setState(ServerState.Started);
                this._fireEvent(Events.ServerStart, solutionPath);
                this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
                this._requestQueue.drain();
            }
            catch (err) {
                this._fireEvent(Events.ServerError, err);
                return this.stop();
            }
        });
    }
    onProjectConfigurationReceived(listener) {
        return this._addListener(Events.ProjectConfiguration, listener);
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            let cleanupPromise;
            // Clear the session properties when the session ends.
            this._sessionProperties = {};
            if (this._telemetryIntervalId !== undefined) {
                // Stop reporting telemetry
                clearInterval(this._telemetryIntervalId);
                this._telemetryIntervalId = undefined;
                this._reportTelemetry();
            }
            if (!this._serverProcess) {
                // nothing to kill
                cleanupPromise = Promise.resolve();
            }
            else if (process.platform === 'win32') {
                // when killing a process in windows its child
                // processes are *not* killed but become root
                // processes. Therefore we use TASKKILL.EXE
                cleanupPromise = new Promise((resolve, reject) => {
                    const killer = child_process_1.exec(`taskkill /F /T /PID ${this._serverProcess.pid}`, (err, stdout, stderr) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                    killer.on('exit', resolve);
                    killer.on('error', reject);
                });
            }
            else {
                // Kill Unix process and children
                cleanupPromise = utils.getUnixChildProcessIds(this._serverProcess.pid)
                    .then(children => {
                    for (let child of children) {
                        process.kill(child, 'SIGTERM');
                    }
                    this._serverProcess.kill('SIGTERM');
                });
            }
            let disposables = this._disposables;
            this._disposables = null;
            return cleanupPromise.then(() => {
                this._serverProcess = null;
                this._setState(ServerState.Stopped);
                this._fireEvent(Events.ServerStop, this);
                if (disposables) {
                    disposables.dispose();
                }
            });
        });
    }
    restart(launchTarget = this._launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            if (launchTarget) {
                yield this.stop();
                this.eventStream.post(new ObservableEvents.OmnisharpRestart());
                const options = this.optionProvider.GetLatestOptions();
                yield this._start(launchTarget, options);
            }
        });
    }
    autoStart(preferredPath) {
        const options = this.optionProvider.GetLatestOptions();
        return launcher_1.findLaunchTargets(options).then((launchTargets) => __awaiter(this, void 0, void 0, function* () {
            // If there aren't any potential launch targets, we create file watcher and try to
            // start the server again once a *.sln, *.slnf, *.csproj, project.json, CSX or Cake file is created.
            if (launchTargets.length === 0) {
                return new Promise((resolve, reject) => {
                    // 1st watch for files
                    let watcher = this.vscode.workspace.createFileSystemWatcher('{**/*.sln,**/*.slnf,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
                    /*ignoreCreateEvents*/ false, 
                    /*ignoreChangeEvents*/ true, 
                    /*ignoreDeleteEvents*/ true);
                    watcher.onDidCreate(uri => {
                        watcher.dispose();
                        resolve();
                    });
                }).then(() => {
                    // 2nd try again
                    return this.autoStart(preferredPath);
                });
            }
            const defaultLaunchSolutionConfigValue = this.optionProvider.GetLatestOptions().defaultLaunchSolution;
            // First, try to launch against something that matches the user's preferred target
            const defaultLaunchSolutionTarget = launchTargets.find((a) => (path.basename(a.target) === defaultLaunchSolutionConfigValue));
            if (defaultLaunchSolutionTarget) {
                return this.restart(defaultLaunchSolutionTarget);
            }
            // If there's more than one launch target, we start the server if one of the targets
            // matches the preferred path. Otherwise, we fire the "MultipleLaunchTargets" event,
            // which is handled in status.ts to display the launch target selector.
            if (launchTargets.length > 1 && preferredPath) {
                for (let launchTarget of launchTargets) {
                    if (launchTarget.target === preferredPath) {
                        // start preferred path
                        return this.restart(launchTarget);
                    }
                }
                this._fireEvent(Events.MultipleLaunchTargets, launchTargets);
                return Promise.reject(undefined);
            }
            // If there's only one target, just start
            return this.restart(launchTargets[0]);
        }));
    }
    // --- requests et al
    makeRequest(command, data, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning()) {
                return Promise.reject('OmniSharp server is not running.');
            }
            let startTime;
            let request;
            let promise = new Promise((resolve, reject) => {
                startTime = Date.now();
                request = {
                    command,
                    data,
                    onSuccess: value => resolve(value),
                    onError: err => reject(err)
                };
                this._requestQueue.enqueue(request);
            });
            if (token) {
                token.onCancellationRequested(() => {
                    this.eventStream.post(new ObservableEvents.OmnisharpServerRequestCancelled(request.command, request.id));
                    this._requestQueue.cancelRequest(request);
                    // Note: This calls reject() on the promise returned by OmniSharpServer.makeRequest
                    request.onError(new Error(`Request ${request.command} cancelled, id: ${request.id}`));
                });
            }
            return promise.then(response => {
                let endTime = Date.now();
                let elapsedTime = endTime - startTime;
                this._recordRequestDelay(command, elapsedTime);
                return response;
            });
        });
    }
    _doConnect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._serverProcess.stderr.on('data', (data) => {
                let trimData = removeBOM_1.removeBOMFromBuffer(data);
                if (trimData.length > 0) {
                    this._fireEvent(Events.StdErr, trimData.toString());
                }
            });
            this._readLine = readline_1.createInterface({
                input: this._serverProcess.stdout,
                output: this._serverProcess.stdin,
                terminal: false
            });
            const promise = new Promise((resolve, reject) => {
                let listener;
                // Convert the timeout from the seconds to milliseconds, which is required by setTimeout().
                const timeoutDuration = options.projectLoadTimeout * 1000;
                // timeout logic
                const handle = timers_1.setTimeout(() => {
                    if (listener) {
                        listener.dispose();
                    }
                    reject(new Error("OmniSharp server load timed out. Use the 'omnisharp.projectLoadTimeout' setting to override the default delay (one minute)."));
                }, timeoutDuration);
                // handle started-event
                listener = this.onOmnisharpStart(() => {
                    if (listener) {
                        listener.dispose();
                    }
                    clearTimeout(handle);
                    resolve();
                });
            });
            const lineReceived = this._onLineReceived.bind(this);
            this._readLine.addListener('line', lineReceived);
            this._disposables.add(new Disposable_1.default(() => {
                this._readLine.removeListener('line', lineReceived);
            }));
            return promise;
        });
    }
    _onLineReceived(line) {
        line = removeBOM_1.removeBOMFromString(line);
        if (line[0] !== '{') {
            this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(line));
            return;
        }
        let packet;
        try {
            packet = JSON.parse(line);
        }
        catch (err) {
            // This isn't JSON
            return;
        }
        if (!packet.Type) {
            // Bogus packet
            return;
        }
        switch (packet.Type) {
            case 'response':
                this._handleResponsePacket(packet);
                break;
            case 'event':
                this._handleEventPacket(packet);
                break;
            default:
                this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(`Unknown packet type: ${packet.Type}`));
                break;
        }
    }
    _handleResponsePacket(packet) {
        const request = this._requestQueue.dequeue(packet.Command, packet.Request_seq);
        if (!request) {
            this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(`Received response for ${packet.Command} but could not find request.`));
            return;
        }
        this.eventStream.post(new ObservableEvents.OmnisharpServerVerboseMessage(`handleResponse: ${packet.Command} (${packet.Request_seq})`));
        if (packet.Success) {
            request.onSuccess(packet.Body);
        }
        else {
            request.onError(packet.Message || packet.Body);
        }
        this._requestQueue.drain();
    }
    _handleEventPacket(packet) {
        if (packet.Event === 'log') {
            const entry = packet.Body;
            this.eventStream.post(new ObservableEvents.OmnisharpEventPacketReceived(entry.LogLevel, entry.Name, entry.Message));
        }
        else {
            // fwd all other events
            this._fireEvent(packet.Event, packet.Body);
        }
    }
    _makeRequest(request) {
        const id = OmniSharpServer._nextId++;
        request.id = id;
        const requestPacket = {
            Type: 'request',
            Seq: id,
            Command: request.command,
            Arguments: request.data
        };
        this.eventStream.post(new ObservableEvents.OmnisharpRequestMessage(request, id));
        this._serverProcess.stdin.write(JSON.stringify(requestPacket) + '\n');
        return id;
    }
}
exports.OmniSharpServer = OmniSharpServer;
OmniSharpServer._nextId = 1;
//# sourceMappingURL=server.js.map