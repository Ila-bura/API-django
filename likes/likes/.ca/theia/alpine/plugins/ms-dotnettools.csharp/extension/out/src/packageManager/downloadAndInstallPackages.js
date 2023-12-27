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
exports.downloadAndInstallPackages = void 0;
const PackageError_1 = require("./PackageError");
const NestedError_1 = require("../NestedError");
const FileDownloader_1 = require("./FileDownloader");
const TarGzInstaller_1 = require("./TarGzInstaller");
const ZipInstaller_1 = require("./ZipInstaller");
const common_1 = require("../common");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const fs_extra_1 = require("fs-extra");
const loggingEvents_2 = require("../omnisharp/loggingEvents");
function downloadAndInstallPackages(packages, provider, eventStream, downloadValidator) {
    return __awaiter(this, void 0, void 0, function* () {
        if (packages) {
            eventStream.post(new loggingEvents_2.PackageInstallStart());
            for (let pkg of packages) {
                let installationStage = "touchBeginFile";
                try {
                    fs_extra_1.mkdirpSync(pkg.installPath.value);
                    yield common_1.touchInstallFile(pkg.installPath, common_1.InstallFileType.Begin);
                    let count = 1;
                    let willTryInstallingPackage = () => count <= 2; // try 2 times
                    while (willTryInstallingPackage()) {
                        count = count + 1;
                        installationStage = "downloadPackage";
                        let buffer = yield FileDownloader_1.DownloadFile(pkg.description, eventStream, provider, pkg.url, pkg.fallbackUrl);
                        if (downloadValidator(buffer, pkg.integrity, eventStream)) {
                            installationStage = "installPackage";
                            if (pkg.url.includes(".tar.gz")) {
                                yield TarGzInstaller_1.InstallTarGz(buffer, pkg.description, pkg.installPath, eventStream);
                            }
                            else {
                                yield ZipInstaller_1.InstallZip(buffer, pkg.description, pkg.installPath, pkg.binaries, eventStream);
                            }
                            installationStage = 'touchLockFile';
                            yield common_1.touchInstallFile(pkg.installPath, common_1.InstallFileType.Lock);
                            break;
                        }
                        else {
                            eventStream.post(new loggingEvents_1.IntegrityCheckFailure(pkg.description, pkg.url, willTryInstallingPackage()));
                        }
                    }
                }
                catch (error) {
                    if (error instanceof NestedError_1.NestedError) {
                        let packageError = new PackageError_1.PackageError(error.message, pkg, error.err);
                        eventStream.post(new loggingEvents_1.InstallationFailure(installationStage, packageError));
                    }
                    else {
                        eventStream.post(new loggingEvents_1.InstallationFailure(installationStage, error));
                    }
                    return false;
                }
                finally {
                    try {
                        if (yield common_1.installFileExists(pkg.installPath, common_1.InstallFileType.Begin)) {
                            yield common_1.deleteInstallFile(pkg.installPath, common_1.InstallFileType.Begin);
                        }
                    }
                    catch (error) { }
                }
            }
            return true; //if all packages succeded in installing return true
        }
    });
}
exports.downloadAndInstallPackages = downloadAndInstallPackages;
//# sourceMappingURL=downloadAndInstallPackages.js.map