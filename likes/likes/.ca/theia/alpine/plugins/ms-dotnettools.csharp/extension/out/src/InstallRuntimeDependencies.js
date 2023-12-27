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
exports.installRuntimeDependencies = void 0;
const loggingEvents_1 = require("./omnisharp/loggingEvents");
const RuntimeDependencyPackageUtils_1 = require("./tools/RuntimeDependencyPackageUtils");
const getAbsolutePathPackagesToInstall_1 = require("./packageManager/getAbsolutePathPackagesToInstall");
function installRuntimeDependencies(packageJSON, extensionPath, installDependencies, eventStream, platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let runTimeDependencies = RuntimeDependencyPackageUtils_1.getRuntimeDependenciesPackages(packageJSON);
        let packagesToInstall = yield getAbsolutePathPackagesToInstall_1.getAbsolutePathPackagesToInstall(runTimeDependencies, platformInfo, extensionPath);
        if (packagesToInstall && packagesToInstall.length > 0) {
            eventStream.post(new loggingEvents_1.PackageInstallation("C# dependencies"));
            // Display platform information and RID
            eventStream.post(new loggingEvents_1.LogPlatformInfo(platformInfo));
            if (yield installDependencies(packagesToInstall)) {
                eventStream.post(new loggingEvents_1.InstallationSuccess());
            }
            else {
                return false;
            }
        }
        //All the required packages are already downloaded and installed
        return true;
    });
}
exports.installRuntimeDependencies = installRuntimeDependencies;
//# sourceMappingURL=InstallRuntimeDependencies.js.map