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
exports.OmnisharpManager = void 0;
const path = require("path");
const semver = require("semver");
const util = require("../common");
class OmnisharpManager {
    constructor(downloader, platformInfo) {
        this.downloader = downloader;
        this.platformInfo = platformInfo;
    }
    GetOmniSharpLaunchInfo(defaultOmnisharpVersion, omnisharpPath, serverUrl, latestVersionFileServerPath, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!omnisharpPath) {
                // If omnisharpPath was not specified, return the default path.
                let basePath = path.resolve(extensionPath, '.omnisharp', defaultOmnisharpVersion);
                return this.GetLaunchInfo(this.platformInfo, basePath);
            }
            // Looks at the options path, installs the dependencies and returns the path to be loaded by the omnisharp server
            if (path.isAbsolute(omnisharpPath)) {
                if (!(yield util.fileExists(omnisharpPath))) {
                    throw new Error('The system could not find the specified path');
                }
                return {
                    LaunchPath: omnisharpPath
                };
            }
            else if (omnisharpPath === 'latest') {
                return yield this.InstallLatestAndReturnLaunchInfo(serverUrl, latestVersionFileServerPath, installPath, extensionPath);
            }
            // If the path is neither a valid path on disk not the string "latest", treat it as a version
            return yield this.InstallVersionAndReturnLaunchInfo(omnisharpPath, serverUrl, installPath, extensionPath);
        });
    }
    InstallLatestAndReturnLaunchInfo(serverUrl, latestVersionFileServerPath, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let version = yield this.downloader.GetLatestVersion(serverUrl, latestVersionFileServerPath);
            return yield this.InstallVersionAndReturnLaunchInfo(version, serverUrl, installPath, extensionPath);
        });
    }
    InstallVersionAndReturnLaunchInfo(version, serverUrl, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (semver.valid(version)) {
                yield this.downloader.DownloadAndInstallOmnisharp(version, serverUrl, installPath);
                return this.GetLaunchPathForVersion(this.platformInfo, version, installPath, extensionPath);
            }
            else {
                throw new Error(`Invalid OmniSharp version - ${version}`);
            }
        });
    }
    GetLaunchPathForVersion(platformInfo, version, installPath, extensionPath) {
        if (!version) {
            throw new Error('Invalid Version');
        }
        let basePath = path.resolve(extensionPath, installPath, version);
        return this.GetLaunchInfo(platformInfo, basePath);
    }
    GetLaunchInfo(platformInfo, basePath) {
        if (platformInfo.isWindows()) {
            return {
                LaunchPath: path.join(basePath, 'OmniSharp.exe')
            };
        }
        return {
            LaunchPath: path.join(basePath, 'run'),
            MonoLaunchPath: path.join(basePath, 'omnisharp', 'OmniSharp.exe')
        };
    }
}
exports.OmnisharpManager = OmnisharpManager;
//# sourceMappingURL=OmnisharpManager.js.map