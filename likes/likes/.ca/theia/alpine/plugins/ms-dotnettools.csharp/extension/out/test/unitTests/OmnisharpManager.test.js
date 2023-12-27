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
const OmnisharpManager_1 = require("../../src/omnisharp/OmnisharpManager");
const MockHttpsServer_1 = require("./testAssets/MockHttpsServer");
const TestZip_1 = require("./testAssets/TestZip");
const TestFile_1 = require("./testAssets/TestFile");
const platform_1 = require("../../src/platform");
const OmnisharpDownloader_1 = require("../../src/omnisharp/OmnisharpDownloader");
const NetworkSettings_1 = require("../../src/NetworkSettings");
const EventStream_1 = require("../../src/EventStream");
const testAssets_1 = require("./testAssets/testAssets");
const CreateTmpAsset_1 = require("../../src/CreateTmpAsset");
const chai_1 = require("chai");
const path = require("path");
const util = require("../../src/common");
suite(OmnisharpManager_1.OmnisharpManager.name, () => {
    let server;
    const eventStream = new EventStream_1.EventStream();
    let manager;
    const defaultVersion = "0.1.2";
    const testVersion = "1.2.3";
    const latestVersion = "2.3.4";
    const latestfilePath = "latestPath";
    const installPath = "somePath";
    let tmpInstallDir;
    let extensionPath;
    let tmpFile;
    let testZip;
    [
        {
            platformInfo: new platform_1.PlatformInformation("win32", "x86"),
            executable: "OmniSharp.exe",
            platformId: "win-x86"
        },
        {
            platformInfo: new platform_1.PlatformInformation("win32", "x86_64"),
            executable: "OmniSharp.exe",
            platformId: "win-x64"
        },
        {
            platformInfo: new platform_1.PlatformInformation("linux", "x86_64"),
            executable: "run",
            platformId: "linux-x64"
        },
        {
            platformInfo: new platform_1.PlatformInformation("linux", "x86"),
            executable: "run",
            platformId: "linux-x86"
        },
        {
            platformInfo: new platform_1.PlatformInformation("darwin", "x86"),
            executable: "run",
            platformId: "osx"
        }
    ].forEach((elem) => {
        suite(elem.platformInfo.toString(), () => {
            setup(() => __awaiter(void 0, void 0, void 0, function* () {
                server = yield MockHttpsServer_1.default.CreateMockHttpsServer();
                yield server.start();
                tmpInstallDir = yield CreateTmpAsset_1.CreateTmpDir(true);
                extensionPath = tmpInstallDir.name;
                manager = GetTestOmniSharpManager(elem.platformInfo, eventStream, extensionPath);
                testZip = yield TestZip_1.default.createTestZipAsync(TestFile_1.createTestFile("Foo", "foo.txt"));
                server.addRequestHandler('GET', `/releases/${testVersion}/omnisharp-${elem.platformId}.zip`, 200, {
                    "content-type": "application/zip",
                    "content-length": testZip.size
                }, testZip.buffer);
                server.addRequestHandler('GET', `/${latestfilePath}`, 200, {
                    "content-type": "application/text",
                }, latestVersion);
                server.addRequestHandler('GET', `/releases/${latestVersion}/omnisharp-${elem.platformId}.zip`, 200, {
                    "content-type": "application/zip",
                    "content-length": testZip.size
                }, testZip.buffer);
            }));
            test('Throws error if the path is neither an absolute path nor a valid semver, nor the string "latest"', () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(manager.GetOmniSharpLaunchInfo(defaultVersion, "Some incorrect path", server.baseUrl, latestfilePath, installPath, extensionPath)).to.be.rejectedWith(Error);
            }));
            test('Throws error when the specified path is an invalid semver', () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(manager.GetOmniSharpLaunchInfo(defaultVersion, "a.b.c", server.baseUrl, latestfilePath, installPath, extensionPath)).to.be.rejectedWith(Error);
            }));
            test('Returns the same path if absolute path to an existing file is passed', () => __awaiter(void 0, void 0, void 0, function* () {
                tmpFile = yield CreateTmpAsset_1.CreateTmpFile();
                let launchInfo = yield manager.GetOmniSharpLaunchInfo(defaultVersion, tmpFile.name, server.baseUrl, latestfilePath, installPath, extensionPath);
                chai_1.expect(launchInfo.LaunchPath).to.be.equal(tmpFile.name);
            }));
            test('Returns the default path if the omnisharp path is not set', () => __awaiter(void 0, void 0, void 0, function* () {
                let launchInfo = yield manager.GetOmniSharpLaunchInfo(defaultVersion, "", server.baseUrl, latestfilePath, installPath, extensionPath);
                chai_1.expect(launchInfo.LaunchPath).to.be.equal(path.join(extensionPath, ".omnisharp", defaultVersion, elem.executable));
                if (elem.platformInfo.isWindows()) {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.undefined;
                }
                else {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.equal(path.join(extensionPath, ".omnisharp", defaultVersion, "omnisharp", "OmniSharp.exe"));
                }
            }));
            test('Installs the latest version and returns the launch path ', () => __awaiter(void 0, void 0, void 0, function* () {
                let launchInfo = yield manager.GetOmniSharpLaunchInfo(defaultVersion, "latest", server.baseUrl, latestfilePath, installPath, extensionPath);
                chai_1.expect(launchInfo.LaunchPath).to.be.equal(path.join(extensionPath, installPath, latestVersion, elem.executable));
                if (elem.platformInfo.isWindows()) {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.undefined;
                }
                else {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.equal(path.join(extensionPath, installPath, latestVersion, "omnisharp", "OmniSharp.exe"));
                }
            }));
            test('Installs the test version and returns the launch path', () => __awaiter(void 0, void 0, void 0, function* () {
                let launchInfo = yield manager.GetOmniSharpLaunchInfo(defaultVersion, testVersion, server.baseUrl, latestfilePath, installPath, extensionPath);
                chai_1.expect(launchInfo.LaunchPath).to.be.equal(path.join(extensionPath, installPath, testVersion, elem.executable));
                if (elem.platformInfo.isWindows()) {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.undefined;
                }
                else {
                    chai_1.expect(launchInfo.MonoLaunchPath).to.be.equal(path.join(extensionPath, installPath, testVersion, "omnisharp", "OmniSharp.exe"));
                }
            }));
            test('Downloads package from given url and installs them at the specified path', () => __awaiter(void 0, void 0, void 0, function* () {
                yield manager.GetOmniSharpLaunchInfo(defaultVersion, testVersion, server.baseUrl, latestfilePath, installPath, extensionPath);
                for (let elem of testZip.files) {
                    let filePath = path.join(extensionPath, installPath, testVersion, elem.path);
                    chai_1.expect(yield util.fileExists(filePath)).to.be.true;
                }
            }));
        });
    });
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield server.stop();
        if (tmpFile) {
            tmpFile.dispose();
            tmpFile = undefined;
        }
        tmpInstallDir.dispose();
        extensionPath = undefined;
    }));
});
function GetTestOmniSharpManager(platformInfo, eventStream, extensionPath) {
    let downloader = new OmnisharpDownloader_1.OmnisharpDownloader(() => new NetworkSettings_1.default(undefined, false), eventStream, testAssets_1.testPackageJSON, platformInfo, extensionPath);
    return new OmnisharpManager_1.OmnisharpManager(downloader, platformInfo);
}
//# sourceMappingURL=OmnisharpManager.test.js.map