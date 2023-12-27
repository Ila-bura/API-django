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
exports.getAbsolutePathPackagesToInstall = void 0;
const AbsolutePathPackage_1 = require("./AbsolutePathPackage");
const PackageFilterer_1 = require("./PackageFilterer");
function getAbsolutePathPackagesToInstall(packages, platformInfo, extensionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (packages && packages.length > 0) {
            let absolutePathPackages = packages.map(pkg => AbsolutePathPackage_1.AbsolutePathPackage.getAbsolutePathPackage(pkg, extensionPath));
            return PackageFilterer_1.getNotInstalledPackagesForPlatform(absolutePathPackages, platformInfo);
        }
        return [];
    });
}
exports.getAbsolutePathPackagesToInstall = getAbsolutePathPackagesToInstall;
//# sourceMappingURL=getAbsolutePathPackagesToInstall.js.map