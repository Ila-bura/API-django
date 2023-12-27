"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebuggerPrerequisiteWarning = exports.DebuggerPrerequisiteFailure = exports.RazorPluginPathDoesNotExist = exports.RazorPluginPathSpecified = exports.IntegrityCheckSuccess = exports.IntegrityCheckFailure = exports.OpenURL = exports.DocumentSynchronizationFailure = exports.DotNetTestDebugInContextStart = exports.DotNetTestRunInContextStart = exports.DotNetTestsInClassDebugStart = exports.DotNetTestsInClassRunStart = exports.DotNetTestDebugProcessStart = exports.DotNetTestDebugStart = exports.DotNetTestRunStart = exports.ReportDotNetTestResults = exports.ZipError = exports.DownloadSizeObtained = exports.DownloadFallBack = exports.DownloadStart = exports.EventWithMessage = exports.WorkspaceInformationUpdated = exports.ProjectConfiguration = exports.OmnisharpOnMultipleLaunchTargets = exports.OmnisharpServerOnServerError = exports.OmnisharpEventPacketReceived = exports.OmnisharpServerProcessRequestStart = exports.OmnisharpServerRequestCancelled = exports.OmnisharpServerDequeueRequest = exports.OmnisharpServerEnqueueRequest = exports.OmnisharpServerUnresolvedDependencies = exports.OmnisharpServerMsBuildProjectDiagnostics = exports.OmnisharpProjectDiagnosticStatus = exports.OmnisharpServerOnError = exports.TestExecutionCountReport = exports.OmnisharpRequestMessage = exports.OmnisharpFailure = exports.DownloadProgress = exports.InstallationFailure = exports.InstallationStart = exports.LogPlatformInfo = exports.PackageInstallation = exports.PackageInstallStart = exports.OmnisharpLaunch = exports.OmnisharpInitialisation = exports.OmnisharpStart = exports.OmnisharpDelayTrackerEventMeasures = exports.TelemetryEventWithMeasures = exports.TelemetryErrorEvent = exports.TelemetryEvent = void 0;
exports.DownloadValidation = exports.DotNetTestDebugComplete = exports.OmnisharpRestart = exports.LatestBuildDownloadStart = exports.OmnisharpServerOnStart = exports.OmnisharpServerOnStop = exports.ActiveTextEditorChanged = exports.OmnisharpOnBeforeServerInstall = exports.OmnisharpOnBeforeServerStart = exports.ProjectJsonDeprecatedWarning = exports.OmnisharpServerProcessRequestComplete = exports.InstallationSuccess = exports.CommandDotNetRestoreStart = exports.DebuggerNotInstalledFailure = exports.ShowOmniSharpChannel = exports.ActivationFailure = exports.ProjectModified = exports.RazorDevModeActive = exports.DotNetTestDebugStartFailure = exports.DotNetTestDebugWarning = exports.DotNetTestRunFailure = exports.DotNetTestMessage = exports.OmnisharpServerVerboseMessage = exports.OmnisharpServerMessage = exports.OmnisharpServerOnStdErr = exports.DownloadFailure = exports.DownloadSuccess = exports.CommandDotNetRestoreFailed = exports.CommandDotNetRestoreSucceeded = exports.CommandDotNetRestoreProgress = void 0;
const EventType_1 = require("./EventType");
class TelemetryEvent {
    constructor(eventName, properties, measures) {
        this.eventName = eventName;
        this.properties = properties;
        this.measures = measures;
        this.type = EventType_1.EventType.TelemetryEvent;
    }
}
exports.TelemetryEvent = TelemetryEvent;
class TelemetryErrorEvent {
    constructor(eventName, properties, measures, errorProps) {
        this.eventName = eventName;
        this.properties = properties;
        this.measures = measures;
        this.errorProps = errorProps;
        this.type = EventType_1.EventType.TelemetryErrorEvent;
    }
}
exports.TelemetryErrorEvent = TelemetryErrorEvent;
class TelemetryEventWithMeasures {
    constructor(eventName, measures) {
        this.eventName = eventName;
        this.measures = measures;
        this.type = EventType_1.EventType.TelemetryEvent;
    }
}
exports.TelemetryEventWithMeasures = TelemetryEventWithMeasures;
class OmnisharpDelayTrackerEventMeasures extends TelemetryEventWithMeasures {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.OmnisharpDelayTrackerEventMeasures;
    }
}
exports.OmnisharpDelayTrackerEventMeasures = OmnisharpDelayTrackerEventMeasures;
class OmnisharpStart extends TelemetryEventWithMeasures {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.OmnisharpStart;
    }
}
exports.OmnisharpStart = OmnisharpStart;
class OmnisharpInitialisation {
    constructor(timeStamp, solutionPath) {
        this.timeStamp = timeStamp;
        this.solutionPath = solutionPath;
        this.type = EventType_1.EventType.OmnisharpInitialisation;
    }
}
exports.OmnisharpInitialisation = OmnisharpInitialisation;
class OmnisharpLaunch {
    constructor(monoVersion, monoPath, command, pid) {
        this.monoVersion = monoVersion;
        this.monoPath = monoPath;
        this.command = command;
        this.pid = pid;
        this.type = EventType_1.EventType.OmnisharpLaunch;
    }
}
exports.OmnisharpLaunch = OmnisharpLaunch;
class PackageInstallStart {
    constructor() {
        this.type = EventType_1.EventType.PackageInstallStart;
    }
}
exports.PackageInstallStart = PackageInstallStart;
class PackageInstallation {
    constructor(packageInfo) {
        this.packageInfo = packageInfo;
        this.type = EventType_1.EventType.PackageInstallation;
    }
}
exports.PackageInstallation = PackageInstallation;
class LogPlatformInfo {
    constructor(info) {
        this.info = info;
        this.type = EventType_1.EventType.LogPlatformInfo;
    }
}
exports.LogPlatformInfo = LogPlatformInfo;
class InstallationStart {
    constructor(packageDescription) {
        this.packageDescription = packageDescription;
        this.type = EventType_1.EventType.InstallationStart;
    }
}
exports.InstallationStart = InstallationStart;
class InstallationFailure {
    constructor(stage, error) {
        this.stage = stage;
        this.error = error;
        this.type = EventType_1.EventType.InstallationFailure;
    }
}
exports.InstallationFailure = InstallationFailure;
class DownloadProgress {
    constructor(downloadPercentage, packageDescription) {
        this.downloadPercentage = downloadPercentage;
        this.packageDescription = packageDescription;
        this.type = EventType_1.EventType.DownloadProgress;
    }
}
exports.DownloadProgress = DownloadProgress;
class OmnisharpFailure {
    constructor(message, error) {
        this.message = message;
        this.error = error;
        this.type = EventType_1.EventType.OmnisharpFailure;
    }
}
exports.OmnisharpFailure = OmnisharpFailure;
class OmnisharpRequestMessage {
    constructor(request, id) {
        this.request = request;
        this.id = id;
        this.type = EventType_1.EventType.OmnisharpRequestMessage;
    }
}
exports.OmnisharpRequestMessage = OmnisharpRequestMessage;
class TestExecutionCountReport {
    constructor(debugCounts, runCounts) {
        this.debugCounts = debugCounts;
        this.runCounts = runCounts;
        this.type = EventType_1.EventType.TestExecutionCountReport;
    }
}
exports.TestExecutionCountReport = TestExecutionCountReport;
class OmnisharpServerOnError {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
        this.type = EventType_1.EventType.OmnisharpServerOnError;
    }
}
exports.OmnisharpServerOnError = OmnisharpServerOnError;
class OmnisharpProjectDiagnosticStatus {
    constructor(message) {
        this.message = message;
        this.type = EventType_1.EventType.ProjectDiagnosticStatus;
    }
}
exports.OmnisharpProjectDiagnosticStatus = OmnisharpProjectDiagnosticStatus;
class OmnisharpServerMsBuildProjectDiagnostics {
    constructor(diagnostics) {
        this.diagnostics = diagnostics;
        this.type = EventType_1.EventType.OmnisharpServerMsBuildProjectDiagnostics;
    }
}
exports.OmnisharpServerMsBuildProjectDiagnostics = OmnisharpServerMsBuildProjectDiagnostics;
class OmnisharpServerUnresolvedDependencies {
    constructor(unresolvedDependencies) {
        this.unresolvedDependencies = unresolvedDependencies;
        this.type = EventType_1.EventType.OmnisharpServerUnresolvedDependencies;
    }
}
exports.OmnisharpServerUnresolvedDependencies = OmnisharpServerUnresolvedDependencies;
class OmnisharpServerEnqueueRequest {
    constructor(queueName, command) {
        this.queueName = queueName;
        this.command = command;
        this.type = EventType_1.EventType.OmnisharpServerEnqueueRequest;
    }
}
exports.OmnisharpServerEnqueueRequest = OmnisharpServerEnqueueRequest;
class OmnisharpServerDequeueRequest {
    constructor(queueName, queueStatus, command, id) {
        this.queueName = queueName;
        this.queueStatus = queueStatus;
        this.command = command;
        this.id = id;
        this.type = EventType_1.EventType.OmnisharpServerDequeueRequest;
    }
}
exports.OmnisharpServerDequeueRequest = OmnisharpServerDequeueRequest;
class OmnisharpServerRequestCancelled {
    constructor(command, id) {
        this.command = command;
        this.id = id;
        this.type = EventType_1.EventType.OmnisharpServerRequestCancelled;
    }
}
exports.OmnisharpServerRequestCancelled = OmnisharpServerRequestCancelled;
class OmnisharpServerProcessRequestStart {
    constructor(name, availableRequestSlots) {
        this.name = name;
        this.availableRequestSlots = availableRequestSlots;
        this.type = EventType_1.EventType.OmnisharpServerProcessRequestStart;
    }
}
exports.OmnisharpServerProcessRequestStart = OmnisharpServerProcessRequestStart;
class OmnisharpEventPacketReceived {
    constructor(logLevel, name, message) {
        this.logLevel = logLevel;
        this.name = name;
        this.message = message;
        this.type = EventType_1.EventType.OmnisharpEventPacketReceived;
    }
}
exports.OmnisharpEventPacketReceived = OmnisharpEventPacketReceived;
class OmnisharpServerOnServerError {
    constructor(err) {
        this.err = err;
        this.type = EventType_1.EventType.OmnisharpServerOnServerError;
    }
}
exports.OmnisharpServerOnServerError = OmnisharpServerOnServerError;
class OmnisharpOnMultipleLaunchTargets {
    constructor(targets) {
        this.targets = targets;
        this.type = EventType_1.EventType.OmnisharpOnMultipleLaunchTargets;
    }
}
exports.OmnisharpOnMultipleLaunchTargets = OmnisharpOnMultipleLaunchTargets;
class ProjectConfiguration {
    constructor(projectConfiguration) {
        this.projectConfiguration = projectConfiguration;
        this.type = EventType_1.EventType.ProjectConfigurationReceived;
    }
}
exports.ProjectConfiguration = ProjectConfiguration;
class WorkspaceInformationUpdated {
    constructor(info) {
        this.info = info;
        this.type = EventType_1.EventType.WorkspaceInformationUpdated;
    }
}
exports.WorkspaceInformationUpdated = WorkspaceInformationUpdated;
class EventWithMessage {
    constructor(message) {
        this.message = message;
        this.type = EventType_1.EventType.EventWithMessage;
    }
}
exports.EventWithMessage = EventWithMessage;
class DownloadStart {
    constructor(packageDescription) {
        this.packageDescription = packageDescription;
        this.type = EventType_1.EventType.DownloadStart;
    }
}
exports.DownloadStart = DownloadStart;
class DownloadFallBack {
    constructor(fallbackUrl) {
        this.fallbackUrl = fallbackUrl;
        this.type = EventType_1.EventType.DownloadFallBack;
    }
}
exports.DownloadFallBack = DownloadFallBack;
class DownloadSizeObtained {
    constructor(packageSize) {
        this.packageSize = packageSize;
        this.type = EventType_1.EventType.DownloadSizeObtained;
    }
}
exports.DownloadSizeObtained = DownloadSizeObtained;
class ZipError {
    constructor(message) {
        this.message = message;
        this.type = EventType_1.EventType.ZipError;
    }
}
exports.ZipError = ZipError;
class ReportDotNetTestResults {
    constructor(results) {
        this.results = results;
        this.type = EventType_1.EventType.ReportDotNetTestResults;
    }
}
exports.ReportDotNetTestResults = ReportDotNetTestResults;
class DotNetTestRunStart {
    constructor(testMethod) {
        this.testMethod = testMethod;
        this.type = EventType_1.EventType.DotNetTestRunStart;
    }
}
exports.DotNetTestRunStart = DotNetTestRunStart;
class DotNetTestDebugStart {
    constructor(testMethod) {
        this.testMethod = testMethod;
        this.type = EventType_1.EventType.DotNetTestDebugStart;
    }
}
exports.DotNetTestDebugStart = DotNetTestDebugStart;
class DotNetTestDebugProcessStart {
    constructor(targetProcessId) {
        this.targetProcessId = targetProcessId;
        this.type = EventType_1.EventType.DotNetTestDebugProcessStart;
    }
}
exports.DotNetTestDebugProcessStart = DotNetTestDebugProcessStart;
class DotNetTestsInClassRunStart {
    constructor(className) {
        this.className = className;
        this.type = EventType_1.EventType.DotNetTestsInClassRunStart;
    }
}
exports.DotNetTestsInClassRunStart = DotNetTestsInClassRunStart;
class DotNetTestsInClassDebugStart {
    constructor(className) {
        this.className = className;
        this.type = EventType_1.EventType.DotNetTestsInClassDebugStart;
    }
}
exports.DotNetTestsInClassDebugStart = DotNetTestsInClassDebugStart;
class DotNetTestRunInContextStart {
    constructor(fileName, line, column) {
        this.fileName = fileName;
        this.line = line;
        this.column = column;
        this.type = EventType_1.EventType.DotNetTestRunInContextStart;
    }
}
exports.DotNetTestRunInContextStart = DotNetTestRunInContextStart;
class DotNetTestDebugInContextStart {
    constructor(fileName, line, column) {
        this.fileName = fileName;
        this.line = line;
        this.column = column;
        this.type = EventType_1.EventType.DotNetTestDebugInContextStart;
    }
}
exports.DotNetTestDebugInContextStart = DotNetTestDebugInContextStart;
class DocumentSynchronizationFailure {
    constructor(documentPath, errorMessage) {
        this.documentPath = documentPath;
        this.errorMessage = errorMessage;
        this.type = EventType_1.EventType.DocumentSynchronizationFailure;
    }
}
exports.DocumentSynchronizationFailure = DocumentSynchronizationFailure;
class OpenURL {
    constructor(url) {
        this.url = url;
        this.type = EventType_1.EventType.OpenURL;
    }
}
exports.OpenURL = OpenURL;
class IntegrityCheckFailure {
    constructor(packageDescription, url, retry) {
        this.packageDescription = packageDescription;
        this.url = url;
        this.retry = retry;
        this.type = EventType_1.EventType.IntegrityCheckFailure;
    }
}
exports.IntegrityCheckFailure = IntegrityCheckFailure;
class IntegrityCheckSuccess {
    constructor() {
        this.type = EventType_1.EventType.IntegrityCheckSuccess;
    }
}
exports.IntegrityCheckSuccess = IntegrityCheckSuccess;
class RazorPluginPathSpecified {
    constructor(path) {
        this.path = path;
        this.type = EventType_1.EventType.RazorPluginPathSpecified;
    }
}
exports.RazorPluginPathSpecified = RazorPluginPathSpecified;
class RazorPluginPathDoesNotExist {
    constructor(path) {
        this.path = path;
        this.type = EventType_1.EventType.RazorPluginPathDoesNotExist;
    }
}
exports.RazorPluginPathDoesNotExist = RazorPluginPathDoesNotExist;
class DebuggerPrerequisiteFailure extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DebuggerPrerequisiteFailure;
    }
}
exports.DebuggerPrerequisiteFailure = DebuggerPrerequisiteFailure;
class DebuggerPrerequisiteWarning extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DebuggerPrerequisiteWarning;
    }
}
exports.DebuggerPrerequisiteWarning = DebuggerPrerequisiteWarning;
class CommandDotNetRestoreProgress extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.CommandDotNetRestoreProgress;
    }
}
exports.CommandDotNetRestoreProgress = CommandDotNetRestoreProgress;
class CommandDotNetRestoreSucceeded extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.CommandDotNetRestoreSucceeded;
    }
}
exports.CommandDotNetRestoreSucceeded = CommandDotNetRestoreSucceeded;
class CommandDotNetRestoreFailed extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.CommandDotNetRestoreFailed;
    }
}
exports.CommandDotNetRestoreFailed = CommandDotNetRestoreFailed;
class DownloadSuccess extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DownloadSuccess;
    }
}
exports.DownloadSuccess = DownloadSuccess;
class DownloadFailure extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DownloadFailure;
    }
}
exports.DownloadFailure = DownloadFailure;
class OmnisharpServerOnStdErr extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.OmnisharpServerOnStdErr;
    }
}
exports.OmnisharpServerOnStdErr = OmnisharpServerOnStdErr;
class OmnisharpServerMessage extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.OmnisharpServerMessage;
    }
}
exports.OmnisharpServerMessage = OmnisharpServerMessage;
class OmnisharpServerVerboseMessage extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.OmnisharpServerVerboseMessage;
    }
}
exports.OmnisharpServerVerboseMessage = OmnisharpServerVerboseMessage;
class DotNetTestMessage extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DotNetTestMessage;
    }
}
exports.DotNetTestMessage = DotNetTestMessage;
class DotNetTestRunFailure extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DotNetTestRunFailure;
    }
}
exports.DotNetTestRunFailure = DotNetTestRunFailure;
class DotNetTestDebugWarning extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DotNetTestDebugWarning;
    }
}
exports.DotNetTestDebugWarning = DotNetTestDebugWarning;
class DotNetTestDebugStartFailure extends EventWithMessage {
    constructor() {
        super(...arguments);
        this.type = EventType_1.EventType.DotNetTestDebugStartFailure;
    }
}
exports.DotNetTestDebugStartFailure = DotNetTestDebugStartFailure;
class RazorDevModeActive {
    constructor() {
        this.type = EventType_1.EventType.RazorDevModeActive;
    }
}
exports.RazorDevModeActive = RazorDevModeActive;
class ProjectModified {
    constructor() {
        this.type = EventType_1.EventType.ProjectModified;
    }
}
exports.ProjectModified = ProjectModified;
class ActivationFailure {
    constructor() {
        this.type = EventType_1.EventType.ActivationFailure;
    }
}
exports.ActivationFailure = ActivationFailure;
class ShowOmniSharpChannel {
    constructor() {
        this.type = EventType_1.EventType.ShowOmniSharpChannel;
    }
}
exports.ShowOmniSharpChannel = ShowOmniSharpChannel;
class DebuggerNotInstalledFailure {
    constructor() {
        this.type = EventType_1.EventType.DebuggerNotInstalledFailure;
    }
}
exports.DebuggerNotInstalledFailure = DebuggerNotInstalledFailure;
class CommandDotNetRestoreStart {
    constructor() {
        this.type = EventType_1.EventType.CommandDotNetRestoreStart;
    }
}
exports.CommandDotNetRestoreStart = CommandDotNetRestoreStart;
class InstallationSuccess {
    constructor() {
        this.type = EventType_1.EventType.InstallationSuccess;
    }
}
exports.InstallationSuccess = InstallationSuccess;
class OmnisharpServerProcessRequestComplete {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpServerProcessRequestComplete;
    }
}
exports.OmnisharpServerProcessRequestComplete = OmnisharpServerProcessRequestComplete;
class ProjectJsonDeprecatedWarning {
    constructor() {
        this.type = EventType_1.EventType.ProjectJsonDeprecatedWarning;
    }
}
exports.ProjectJsonDeprecatedWarning = ProjectJsonDeprecatedWarning;
class OmnisharpOnBeforeServerStart {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpOnBeforeServerStart;
    }
}
exports.OmnisharpOnBeforeServerStart = OmnisharpOnBeforeServerStart;
class OmnisharpOnBeforeServerInstall {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpOnBeforeServerInstall;
    }
}
exports.OmnisharpOnBeforeServerInstall = OmnisharpOnBeforeServerInstall;
class ActiveTextEditorChanged {
    constructor() {
        this.type = EventType_1.EventType.ActiveTextEditorChanged;
    }
}
exports.ActiveTextEditorChanged = ActiveTextEditorChanged;
class OmnisharpServerOnStop {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpServerOnStop;
    }
}
exports.OmnisharpServerOnStop = OmnisharpServerOnStop;
class OmnisharpServerOnStart {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpServerOnStart;
    }
}
exports.OmnisharpServerOnStart = OmnisharpServerOnStart;
class LatestBuildDownloadStart {
    constructor() {
        this.type = EventType_1.EventType.LatestBuildDownloadStart;
    }
}
exports.LatestBuildDownloadStart = LatestBuildDownloadStart;
class OmnisharpRestart {
    constructor() {
        this.type = EventType_1.EventType.OmnisharpRestart;
    }
}
exports.OmnisharpRestart = OmnisharpRestart;
class DotNetTestDebugComplete {
    constructor() {
        this.type = EventType_1.EventType.DotNetTestDebugComplete;
    }
}
exports.DotNetTestDebugComplete = DotNetTestDebugComplete;
class DownloadValidation {
    constructor() {
        this.type = EventType_1.EventType.DownloadValidation;
    }
}
exports.DownloadValidation = DownloadValidation;
//# sourceMappingURL=loggingEvents.js.map