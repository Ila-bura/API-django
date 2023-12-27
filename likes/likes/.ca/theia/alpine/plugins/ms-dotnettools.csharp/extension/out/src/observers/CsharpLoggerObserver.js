"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsharpLoggerObserver = void 0;
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const PackageError_1 = require("../packageManager/PackageError");
const EventType_1 = require("../omnisharp/EventType");
class CsharpLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.ActivationFailure:
                    this.logger.appendLine("[ERROR]: C# Extension failed to get platform information.");
                    break;
                case EventType_1.EventType.PackageInstallation:
                    this.handlePackageInstallation(event);
                    break;
                case EventType_1.EventType.LogPlatformInfo:
                    this.handlePlatformInfo(event);
                    break;
                case EventType_1.EventType.InstallationFailure:
                    this.handleInstallationFailure(event);
                    break;
                case EventType_1.EventType.InstallationSuccess:
                    this.logger.appendLine('Finished');
                    this.logger.appendLine();
                    break;
                case EventType_1.EventType.InstallationStart:
                    this.handleInstallationStart(event);
                    break;
                case EventType_1.EventType.DownloadStart:
                    this.handleDownloadStart(event);
                    break;
                case EventType_1.EventType.DownloadProgress:
                    this.handleDownloadProgress(event);
                    break;
                case EventType_1.EventType.DownloadSuccess:
                case EventType_1.EventType.DownloadFailure:
                case EventType_1.EventType.DebuggerPrerequisiteFailure:
                case EventType_1.EventType.DebuggerPrerequisiteWarning:
                    this.handleEventWithMessage(event);
                    break;
                case EventType_1.EventType.ProjectJsonDeprecatedWarning:
                    this.logger.appendLine("Warning: project.json is no longer a supported project format for .NET Core applications. Update to the latest version of .NET Core (https://aka.ms/netcoredownload) and use 'dotnet migrate' to upgrade your project (see https://aka.ms/netcoremigrate for details).");
                    break;
                case EventType_1.EventType.DownloadFallBack:
                    this.handleDownloadFallback(event);
                    break;
                case EventType_1.EventType.DownloadSizeObtained:
                    this.handleDownloadSizeObtained(event);
                    break;
                case EventType_1.EventType.DocumentSynchronizationFailure:
                    this.handleDocumentSynchronizationFailure(event);
                    break;
                case EventType_1.EventType.LatestBuildDownloadStart:
                    this.logger.appendLine("Getting latest OmniSharp version information");
                    break;
                case EventType_1.EventType.IntegrityCheckFailure:
                    this.handleIntegrityCheckFailure(event);
                    break;
                case EventType_1.EventType.DownloadValidation:
                    this.handleDownloadValidation(event);
                    break;
                case EventType_1.EventType.IntegrityCheckSuccess:
                    this.handleIntegrityCheckSuccess(event);
                    break;
            }
        };
    }
    handleDownloadValidation(event) {
        this.logger.appendLine("Validating download...");
    }
    handleIntegrityCheckSuccess(event) {
        this.logger.appendLine("Integrity Check succeeded.");
    }
    handleIntegrityCheckFailure(event) {
        if (event.retry) {
            this.logger.appendLine(`Package ${event.packageDescription} failed integrity check. Retrying..`);
        }
        else {
            this.logger.appendLine(`Package ${event.packageDescription} download from ${event.url} failed integrity check. Some features may not work as expected. Please restart Visual Studio Code to retrigger the download.`);
        }
    }
    handleDownloadSizeObtained(event) {
        this.logger.append(`(${Math.ceil(event.packageSize / 1024)} KB)`);
    }
    handleDownloadFallback(event) {
        this.logger.append(`\tRetrying from '${event.fallbackUrl}' `);
    }
    handleEventWithMessage(event) {
        this.logger.appendLine(event.message);
    }
    handlePackageInstallation(event) {
        this.logger.append(`Installing ${event.packageInfo}...`);
        this.logger.appendLine();
    }
    handlePlatformInfo(event) {
        this.logger.appendLine(`Platform: ${event.info.toString()}`);
        this.logger.appendLine();
    }
    handleInstallationFailure(event) {
        this.logger.appendLine(`Failed at stage: ${event.stage}`);
        if (event.error instanceof PackageError_1.PackageError) {
            if (event.error.innerError) {
                this.logger.appendLine(event.error.innerError.toString());
            }
            else {
                this.logger.appendLine(event.error.message);
            }
        }
        else {
            // do not log raw errorMessage in telemetry as it is likely to contain PII.
            this.logger.appendLine(event.error.toString());
        }
        this.logger.appendLine();
    }
    handleDownloadProgress(event) {
        let newDots = Math.ceil(event.downloadPercentage / 5);
        this.logger.append('.'.repeat(newDots - this.dots));
        this.dots = newDots;
    }
    handleDownloadStart(event) {
        this.logger.append(`Downloading package '${event.packageDescription}' `);
        this.dots = 0;
    }
    handleInstallationStart(event) {
        this.logger.appendLine(`Installing package '${event.packageDescription}'`);
        this.logger.appendLine();
    }
    handleDocumentSynchronizationFailure(event) {
        this.logger.appendLine(`Failed to synchronize document '${event.documentPath}': ${event.errorMessage}`);
    }
}
exports.CsharpLoggerObserver = CsharpLoggerObserver;
//# sourceMappingURL=CsharpLoggerObserver.js.map