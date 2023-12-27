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
exports.getTargetArchitecture = exports.CoreClrDebugUtil = exports.DotNetCliError = void 0;
const path = require("path");
const fs = require("fs");
const semver = require("semver");
const os = require("os");
const getDotnetInfo_1 = require("../utils/getDotnetInfo");
const MINIMUM_SUPPORTED_DOTNET_CLI = '1.0.0';
class DotNetCliError extends Error {
}
exports.DotNetCliError = DotNetCliError;
class CoreClrDebugUtil {
    constructor(extensionDir) {
        this._extensionDir = '';
        this._debugAdapterDir = '';
        this._installCompleteFilePath = '';
        this._extensionDir = extensionDir;
        this._debugAdapterDir = path.join(this._extensionDir, '.debugger');
        this._installCompleteFilePath = path.join(this._debugAdapterDir, 'install.complete');
    }
    extensionDir() {
        if (this._extensionDir === '') {
            throw new Error('Failed to set extension directory');
        }
        return this._extensionDir;
    }
    debugAdapterDir() {
        if (this._debugAdapterDir === '') {
            throw new Error('Failed to set debugadpter directory');
        }
        return this._debugAdapterDir;
    }
    installCompleteFilePath() {
        if (this._installCompleteFilePath === '') {
            throw new Error('Failed to set install complete file path');
        }
        return this._installCompleteFilePath;
    }
    static writeEmptyFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(path, '', (err) => {
                    if (err) {
                        reject(err.code);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    defaultDotNetCliErrorMessage() {
        return 'Failed to find up to date dotnet cli on the path.';
    }
    // This function checks for the presence of dotnet on the path and ensures the Version
    // is new enough for us.
    // Returns: a promise that returns a DotnetInfo class
    // Throws: An DotNetCliError() from the return promise if either dotnet does not exist or is too old.
    checkDotNetCli() {
        return __awaiter(this, void 0, void 0, function* () {
            let dotnetInfo = yield getDotnetInfo_1.getDotnetInfo();
            if (dotnetInfo.FullInfo === getDotnetInfo_1.DOTNET_MISSING_MESSAGE) {
                // something went wrong with spawning 'dotnet --info'
                let dotnetError = new DotNetCliError();
                dotnetError.ErrorMessage = 'The .NET Core SDK cannot be located. .NET Core debugging will not be enabled. Make sure the .NET Core SDK is installed and is on the path.';
                dotnetError.ErrorString = "Failed to spawn 'dotnet --info'";
                throw dotnetError;
            }
            // succesfully spawned 'dotnet --info', check the Version
            if (semver.lt(dotnetInfo.Version, MINIMUM_SUPPORTED_DOTNET_CLI)) {
                let dotnetError = new DotNetCliError();
                dotnetError.ErrorMessage = 'The .NET Core SDK located on the path is too old. .NET Core debugging will not be enabled. The minimum supported version is ' + MINIMUM_SUPPORTED_DOTNET_CLI + '.';
                dotnetError.ErrorString = "dotnet cli is too old";
                throw dotnetError;
            }
            return dotnetInfo;
        });
    }
    static isMacOSSupported() {
        // .NET Core 2.0 requires macOS 10.12 (Sierra), which is Darwin 16.0+
        // Darwin version chart: https://en.wikipedia.org/wiki/Darwin_(operating_system)
        return semver.gte(os.release(), "16.0.0");
    }
    static existsSync(path) {
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                return false;
            }
            else {
                throw Error(err.code);
            }
        }
    }
    static getPlatformExeExtension() {
        if (process.platform === 'win32') {
            return '.exe';
        }
        return '';
    }
}
exports.CoreClrDebugUtil = CoreClrDebugUtil;
const MINIMUM_SUPPORTED_OSX_ARM64_DOTNET_CLI = '6.0.0';
function getTargetArchitecture(platformInfo, launchJsonTargetArchitecture, dotnetInfo) {
    if (!platformInfo) {
        throw new Error(`Unable to retrieve 'TargetArchitecture' without platformInfo.`);
    }
    let targetArchitecture = "";
    // On Apple M1 Machines, we need to determine if we need to use the 'x86_64' or 'arm64' debugger.
    if (platformInfo.isMacOS()) {
        // 'targetArchitecture' is specified in launch.json configuration, use that.
        if (launchJsonTargetArchitecture) {
            if (launchJsonTargetArchitecture !== "x86_64" && launchJsonTargetArchitecture !== "arm64") {
                throw new Error(`The value '${launchJsonTargetArchitecture}' for 'targetArchitecture' in launch configuraiton is invalid. Expected 'x86_64' or 'arm64'.`);
            }
            targetArchitecture = launchJsonTargetArchitecture;
        }
        else if (dotnetInfo) {
            // Find which targetArchitecture to use based on SDK Version or RID.
            // If we are lower than .NET 6, use 'x86_64' since 'arm64' was not supported until .NET 6
            if (dotnetInfo.Version && semver.lt(dotnetInfo.Version, MINIMUM_SUPPORTED_OSX_ARM64_DOTNET_CLI)) {
                targetArchitecture = 'x86_64';
            }
            else if (dotnetInfo.RuntimeId) {
                if (dotnetInfo.RuntimeId.includes('arm64')) {
                    targetArchitecture = 'arm64';
                }
                else if (dotnetInfo.RuntimeId.includes('x64')) {
                    targetArchitecture = 'x86_64';
                }
                else {
                    throw new Error(`Unexpected RuntimeId '${dotnetInfo.RuntimeId}'.`);
                }
            }
        }
        if (!targetArchitecture) {
            // Unable to retrieve any targetArchitecture, go with platformInfo.
            targetArchitecture = platformInfo.architecture;
        }
    }
    return targetArchitecture;
}
exports.getTargetArchitecture = getTargetArchitecture;
//# sourceMappingURL=util.js.map