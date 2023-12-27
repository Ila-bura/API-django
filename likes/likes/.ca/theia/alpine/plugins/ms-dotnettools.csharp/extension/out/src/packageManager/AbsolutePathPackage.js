"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsolutePathPackage = void 0;
const AbsolutePath_1 = require("./AbsolutePath");
class AbsolutePathPackage {
    constructor(id, description, url, platforms, architectures, binaries, installPath, installTestPath, fallbackUrl, platformId, integrity) {
        this.id = id;
        this.description = description;
        this.url = url;
        this.platforms = platforms;
        this.architectures = architectures;
        this.binaries = binaries;
        this.installPath = installPath;
        this.installTestPath = installTestPath;
        this.fallbackUrl = fallbackUrl;
        this.platformId = platformId;
        this.integrity = integrity;
    }
    static getAbsolutePathPackage(pkg, extensionPath) {
        return new AbsolutePathPackage(pkg.id, pkg.description, pkg.url, pkg.platforms, pkg.architectures, getAbsoluteBinaries(pkg, extensionPath), getAbsoluteInstallPath(pkg, extensionPath), getAbsoluteInstallTestPath(pkg, extensionPath), pkg.fallbackUrl, pkg.platformId, pkg.integrity);
    }
}
exports.AbsolutePathPackage = AbsolutePathPackage;
function getAbsoluteInstallTestPath(pkg, extensionPath) {
    if (pkg.installTestPath) {
        return AbsolutePath_1.AbsolutePath.getAbsolutePath(extensionPath, pkg.installTestPath);
    }
    return null;
}
function getAbsoluteBinaries(pkg, extensionPath) {
    let basePath = getAbsoluteInstallPath(pkg, extensionPath).value;
    if (pkg.binaries) {
        return pkg.binaries.map(value => AbsolutePath_1.AbsolutePath.getAbsolutePath(basePath, value));
    }
    return null;
}
function getAbsoluteInstallPath(pkg, extensionPath) {
    if (pkg.installPath) {
        return AbsolutePath_1.AbsolutePath.getAbsolutePath(extensionPath, pkg.installPath);
    }
    return new AbsolutePath_1.AbsolutePath(extensionPath);
}
//# sourceMappingURL=AbsolutePathPackage.js.map