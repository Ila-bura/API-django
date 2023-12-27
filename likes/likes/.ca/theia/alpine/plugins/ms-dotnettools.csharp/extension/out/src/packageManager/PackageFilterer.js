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
exports.filterPlatformPackages = exports.getNotInstalledPackagesForPlatform = void 0;
const util = require("../common");
const PackageError_1 = require("./PackageError");
function getNotInstalledPackagesForPlatform(packages, platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let platformPackages = filterPlatformPackages(packages, platformInfo);
        return filterAlreadyInstalledPackages(platformPackages);
    });
}
exports.getNotInstalledPackagesForPlatform = getNotInstalledPackagesForPlatform;
function filterPlatformPackages(packages, platformInfo) {
    if (packages) {
        return packages.filter(pkg => {
            if (pkg.architectures && pkg.architectures.indexOf(platformInfo.architecture) === -1) {
                return false;
            }
            if (pkg.platforms && pkg.platforms.indexOf(platformInfo.platform) === -1) {
                return false;
            }
            return true;
        });
    }
    else {
        throw new PackageError_1.PackageError("Package manifest does not exist.");
    }
}
exports.filterPlatformPackages = filterPlatformPackages;
function filterAlreadyInstalledPackages(packages) {
    return __awaiter(this, void 0, void 0, function* () {
        return util.filterAsync(packages, (pkg) => __awaiter(this, void 0, void 0, function* () {
            //If the install.Lock file is present for this package then do not install it again
            let testPath = util.getInstallFilePath(pkg.installPath, util.InstallFileType.Lock);
            if (!testPath) {
                //if there is no testPath then we will not filter it
                return true;
            }
            return !(yield util.fileExists(testPath));
        }));
    });
}
//# sourceMappingURL=PackageFilterer.js.map