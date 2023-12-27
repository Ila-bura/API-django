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
exports.OmnisharpDownloader = void 0;
const OmnisharpPackageCreator_1 = require("./OmnisharpPackageCreator");
const loggingEvents_1 = require("./loggingEvents");
const downloadAndInstallPackages_1 = require("../packageManager/downloadAndInstallPackages");
const FileDownloader_1 = require("../packageManager/FileDownloader");
const RuntimeDependencyPackageUtils_1 = require("../tools/RuntimeDependencyPackageUtils");
const getAbsolutePathPackagesToInstall_1 = require("../packageManager/getAbsolutePathPackagesToInstall");
const isValidDownload_1 = require("../packageManager/isValidDownload");
class OmnisharpDownloader {
    constructor(networkSettingsProvider, eventStream, packageJSON, platformInfo, extensionPath) {
        this.networkSettingsProvider = networkSettingsProvider;
        this.eventStream = eventStream;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.extensionPath = extensionPath;
    }
    DownloadAndInstallOmnisharp(version, serverUrl, installPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let runtimeDependencies = RuntimeDependencyPackageUtils_1.getRuntimeDependenciesPackages(this.packageJSON);
            let omniSharpPackages = OmnisharpPackageCreator_1.GetPackagesFromVersion(version, runtimeDependencies, serverUrl, installPath);
            let packagesToInstall = yield getAbsolutePathPackagesToInstall_1.getAbsolutePathPackagesToInstall(omniSharpPackages, this.platformInfo, this.extensionPath);
            if (packagesToInstall && packagesToInstall.length > 0) {
                this.eventStream.post(new loggingEvents_1.PackageInstallation(`OmniSharp Version = ${version}`));
                this.eventStream.post(new loggingEvents_1.LogPlatformInfo(this.platformInfo));
                if (yield downloadAndInstallPackages_1.downloadAndInstallPackages(packagesToInstall, this.networkSettingsProvider, this.eventStream, isValidDownload_1.isValidDownload)) {
                    this.eventStream.post(new loggingEvents_1.InstallationSuccess());
                    return true;
                }
                return false;
            }
        });
    }
    GetLatestVersion(serverUrl, latestVersionFileServerPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let description = "Latest OmniSharp Version Information";
            let url = `${serverUrl}/${latestVersionFileServerPath}`;
            try {
                this.eventStream.post(new loggingEvents_1.LatestBuildDownloadStart());
                let versionBuffer = yield FileDownloader_1.DownloadFile(description, this.eventStream, this.networkSettingsProvider, url);
                return versionBuffer.toString('utf8');
            }
            catch (error) {
                this.eventStream.post(new loggingEvents_1.InstallationFailure('getLatestVersionInfoFile', error));
                throw error;
            }
        });
    }
}
exports.OmnisharpDownloader = OmnisharpDownloader;
//# sourceMappingURL=OmnisharpDownloader.js.map