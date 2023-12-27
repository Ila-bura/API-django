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
const debugUtil = require("../src/coreclr-debug/util");
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const path = require("path");
const spawnNode_1 = require("../tasks/spawnNode");
const projectPaths_1 = require("../tasks/projectPaths");
const CsharpLoggerObserver_1 = require("../src/observers/CsharpLoggerObserver");
const EventStream_1 = require("../src/EventStream");
const packageJson_1 = require("../tasks/packageJson");
const logger_1 = require("../src/logger");
const platform_1 = require("../src/platform");
const downloadAndInstallPackages_1 = require("../src/packageManager/downloadAndInstallPackages");
const NetworkSettings_1 = require("../src/NetworkSettings");
const commandLineArguments_1 = require("../tasks/commandLineArguments");
const RuntimeDependencyPackageUtils_1 = require("../src/tools/RuntimeDependencyPackageUtils");
const getAbsolutePathPackagesToInstall_1 = require("../src/packageManager/getAbsolutePathPackagesToInstall");
const isValidDownload_1 = require("../src/packageManager/isValidDownload");
gulp.task('vsix:offline:package', () => __awaiter(void 0, void 0, void 0, function* () {
    del.sync(projectPaths_1.vscodeignorePath);
    fs.copyFileSync(projectPaths_1.offlineVscodeignorePath, projectPaths_1.vscodeignorePath);
    try {
        yield doPackageOffline();
    }
    finally {
        del(projectPaths_1.vscodeignorePath);
    }
}));
function doPackageOffline() {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandLineArguments_1.commandLineOptions.retainVsix) {
            //if user doesnot want to clean up the existing vsix packages
            cleanSync(false);
        }
        else {
            cleanSync(true);
        }
        const packageJSON = packageJson_1.getPackageJSON();
        const name = packageJSON.name;
        const version = packageJSON.version;
        const packageName = name + '.' + version;
        const packages = [
            new platform_1.PlatformInformation('win32', 'x86_64'),
            new platform_1.PlatformInformation('darwin', 'x86_64'),
            new platform_1.PlatformInformation('linux', 'x86_64')
        ];
        for (let platformInfo of packages) {
            yield doOfflinePackage(platformInfo, packageName, packageJSON, projectPaths_1.packedVsixOutputRoot);
        }
    });
}
function cleanSync(deleteVsix) {
    del.sync('install.*');
    del.sync('.omnisharp*');
    del.sync('.debugger');
    del.sync('.razor');
    if (deleteVsix) {
        del.sync('*.vsix');
    }
}
function doOfflinePackage(platformInfo, packageName, packageJSON, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.platform === 'win32') {
            throw new Error('Do not build offline packages on windows. Runtime executables will not be marked executable in *nix packages.');
        }
        cleanSync(false);
        const packageFileName = `${packageName}-${platformInfo.platform}-${platformInfo.architecture}.vsix`;
        yield install(platformInfo, packageJSON);
        yield doPackageSync(packageFileName, outputFolder);
    });
}
// Install Tasks
function install(platformInfo, packageJSON) {
    return __awaiter(this, void 0, void 0, function* () {
        let eventStream = new EventStream_1.EventStream();
        const logger = new logger_1.Logger(message => process.stdout.write(message));
        let stdoutObserver = new CsharpLoggerObserver_1.CsharpLoggerObserver(logger);
        eventStream.subscribe(stdoutObserver.post);
        const debuggerUtil = new debugUtil.CoreClrDebugUtil(path.resolve('.'));
        let runTimeDependencies = RuntimeDependencyPackageUtils_1.getRuntimeDependenciesPackages(packageJSON);
        let packagesToInstall = yield getAbsolutePathPackagesToInstall_1.getAbsolutePathPackagesToInstall(runTimeDependencies, platformInfo, projectPaths_1.codeExtensionPath);
        let provider = () => new NetworkSettings_1.default(undefined, undefined);
        yield downloadAndInstallPackages_1.downloadAndInstallPackages(packagesToInstall, provider, eventStream, isValidDownload_1.isValidDownload);
        yield debugUtil.CoreClrDebugUtil.writeEmptyFile(debuggerUtil.installCompleteFilePath());
    });
}
/// Packaging (VSIX) Tasks
function doPackageSync(packageName, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let vsceArgs = [];
        vsceArgs.push(projectPaths_1.vscePath);
        vsceArgs.push('package'); // package command
        if (packageName !== undefined) {
            vsceArgs.push('-o');
            if (outputFolder) {
                //if we have specified an output folder then put the files in that output folder
                vsceArgs.push(path.join(outputFolder, packageName));
            }
            else {
                vsceArgs.push(packageName);
            }
        }
        return spawnNode_1.default(vsceArgs);
    });
}
//# sourceMappingURL=offlinePackagingTasks.js.map