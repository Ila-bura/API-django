"use strict";
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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai = require("chai");
const platform_1 = require("../../../src/platform");
const PackageFilterer_1 = require("../../../src/packageManager/PackageFilterer");
const AbsolutePathPackage_1 = require("../../../src/packageManager/AbsolutePathPackage");
const path_1 = require("path");
let expect = chai.expect;
const mock = require("mock-fs");
suite(`${PackageFilterer_1.getNotInstalledPackagesForPlatform.name}`, () => {
    let absolutePathPackages;
    let extensionPath = "/ExtensionPath";
    const packages = [
        {
            "description": "Platfrom1-Architecture1 uninstalled package",
            "platforms": ["platform1"],
            "architectures": ["architecture1"],
            "installPath": "path1"
        },
        {
            //already installed package
            "description": "Platfrom1-Architecture1 installed package",
            "platforms": ["platform1"],
            "architectures": ["architecture1"],
            "installPath": "path5"
        },
        {
            "description": "Platfrom2-Architecture2 uninstalled package",
            "platforms": ["platform2"],
            "architectures": ["architecture2"],
            "installPath": "path2"
        },
        {
            "description": "Platfrom1-Architecture2 uninstalled package",
            "platforms": ["platform1"],
            "architectures": ["architecture2"],
            "installPath": "path3"
        },
        {
            "description": "Platfrom2-Architecture1 uninstalled package",
            "platforms": ["platform2"],
            "architectures": ["architecture1"],
            "installPath": "path4"
        },
        {
            "description": "Platfrom1-Architecture2 uninstalled package",
            "platforms": ["platform1"],
            "architectures": ["architecture2"],
            "installPath": "path3"
        },
    ];
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        absolutePathPackages = packages.map(pkg => AbsolutePathPackage_1.AbsolutePathPackage.getAbsolutePathPackage(pkg, extensionPath));
        let installLockPath = path_1.join(absolutePathPackages[1].installPath.value, "install.Lock");
        //mock the install lock path so the package should be filtered
        mock({
            [installLockPath]: "no content"
        });
    }));
    test('Filters the packages based on Platform Information', () => __awaiter(void 0, void 0, void 0, function* () {
        let platformInfo = new platform_1.PlatformInformation("platform2", "architecture2");
        let filteredPackages = yield PackageFilterer_1.getNotInstalledPackagesForPlatform(absolutePathPackages, platformInfo);
        expect(filteredPackages.length).to.be.equal(1);
        expect(filteredPackages[0].description).to.be.equal("Platfrom2-Architecture2 uninstalled package");
        expect(filteredPackages[0].platforms[0]).to.be.equal("platform2");
        expect(filteredPackages[0].architectures[0]).to.be.equal("architecture2");
    }));
    test('Returns only the packages where install.Lock is not present', () => __awaiter(void 0, void 0, void 0, function* () {
        let platformInfo = new platform_1.PlatformInformation("platform1", "architecture1");
        let filteredPackages = yield PackageFilterer_1.getNotInstalledPackagesForPlatform(absolutePathPackages, platformInfo);
        expect(filteredPackages.length).to.be.equal(1);
        expect(filteredPackages[0].description).to.be.equal("Platfrom1-Architecture1 uninstalled package");
        expect(filteredPackages[0].platforms[0]).to.be.equal("platform1");
        expect(filteredPackages[0].architectures[0]).to.be.equal("architecture1");
    }));
    teardown(() => {
        mock.restore();
    });
});
//# sourceMappingURL=PackageFilterer.test.js.map