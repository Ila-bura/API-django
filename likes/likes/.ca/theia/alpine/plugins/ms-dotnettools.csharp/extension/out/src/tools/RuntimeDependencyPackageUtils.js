"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuntimeDependenciesPackages = exports.getRuntimeDependencyPackageWithId = void 0;
const AbsolutePathPackage_1 = require("../packageManager/AbsolutePathPackage");
const PackageFilterer_1 = require("../packageManager/PackageFilterer");
function getRuntimeDependencyPackageWithId(packageId, packageJSON, platformInfo, extensionPath) {
    let runtimeDependencies = getRuntimeDependenciesPackages(packageJSON);
    let absolutePathPackages = runtimeDependencies.map(pkg => AbsolutePathPackage_1.AbsolutePathPackage.getAbsolutePathPackage(pkg, extensionPath));
    let platformSpecificPackage = PackageFilterer_1.filterPlatformPackages(absolutePathPackages, platformInfo);
    return platformSpecificPackage.find(pkg => pkg.id == packageId);
}
exports.getRuntimeDependencyPackageWithId = getRuntimeDependencyPackageWithId;
function getRuntimeDependenciesPackages(packageJSON) {
    if (packageJSON.runtimeDependencies) {
        return JSON.parse(JSON.stringify(packageJSON.runtimeDependencies));
    }
    throw new Error("No runtime dependencies found");
}
exports.getRuntimeDependenciesPackages = getRuntimeDependenciesPackages;
//# sourceMappingURL=RuntimeDependencyPackageUtils.js.map