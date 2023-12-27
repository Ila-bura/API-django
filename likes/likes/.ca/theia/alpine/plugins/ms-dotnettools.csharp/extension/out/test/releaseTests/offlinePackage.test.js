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
const chai = require("chai");
const glob = require("glob-promise");
const path = require("path");
const testAssets_1 = require("./testAssets/testAssets");
const platform_1 = require("../../src/platform");
const CreateTmpAsset_1 = require("../../src/CreateTmpAsset");
suite("Offline packaging of VSIX", function () {
    let vsixFiles;
    this.timeout(1000000);
    let tmpDir;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        chai.should();
        tmpDir = yield CreateTmpAsset_1.CreateTmpDir(true);
        let args = [];
        args.push(path.join("node_modules", "gulp", "bin", "gulp.js"));
        args.push("package:offline");
        args.push("--retainVsix"); // do not delete the existing vsix in the repo
        args.push(`-o`);
        args.push(tmpDir.name);
        testAssets_1.invokeNode(args);
        vsixFiles = glob.sync(path.join(tmpDir.name, '*.vsix'));
    }));
    test("Exactly 3 vsix files should be produced", () => {
        vsixFiles.length.should.be.equal(3, "the build should produce exactly 3 vsix files");
    });
    [
        new platform_1.PlatformInformation('win32', 'x86_64'),
        new platform_1.PlatformInformation('darwin', 'x86_64'),
        new platform_1.PlatformInformation('linux', 'x86_64')
    ].forEach(element => {
        test(`Given Platform: ${element.platform} and Architecture: ${element.architecture}, the vsix file is created`, () => {
            vsixFiles.findIndex(elem => elem.indexOf(element.platform) != -1).should.not.be.equal(-1);
            vsixFiles.findIndex(elem => elem.indexOf(element.architecture) != -1).should.not.be.equal(-1);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        if (tmpDir) {
            tmpDir.dispose();
        }
    }));
});
//# sourceMappingURL=offlinePackage.test.js.map