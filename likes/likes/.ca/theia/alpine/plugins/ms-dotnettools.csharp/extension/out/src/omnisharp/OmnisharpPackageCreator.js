"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBinaryAndGetPackage = exports.GetPackagesFromVersion = void 0;
function GetPackagesFromVersion(version, runTimeDependencies, serverUrl, installPath) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackages = new Array();
    for (let inputPackage of runTimeDependencies) {
        if (inputPackage.platformId) {
            versionPackages.push(SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath));
        }
    }
    return versionPackages;
}
exports.GetPackagesFromVersion = GetPackagesFromVersion;
function SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath) {
    let installBinary;
    if (inputPackage.platformId === "win-x86" || inputPackage.platformId === "win-x64") {
        installBinary = "OmniSharp.exe";
    }
    else {
        installBinary = "run";
    }
    return GetPackage(inputPackage, serverUrl, version, installPath, installBinary);
}
exports.SetBinaryAndGetPackage = SetBinaryAndGetPackage;
function GetPackage(inputPackage, serverUrl, version, installPath, installBinary) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackage = {
        id: inputPackage.id,
        description: `${inputPackage.description}, Version = ${version}`,
        url: `${serverUrl}/releases/${version}/omnisharp-${inputPackage.platformId}.zip`,
        installPath: `${installPath}/${version}`,
        installTestPath: `./${installPath}/${version}/${installBinary}`,
        platforms: inputPackage.platforms,
        architectures: inputPackage.architectures,
        binaries: inputPackage.binaries,
        platformId: inputPackage.platformId
    };
    return versionPackage;
}
//# sourceMappingURL=OmnisharpPackageCreator.js.map