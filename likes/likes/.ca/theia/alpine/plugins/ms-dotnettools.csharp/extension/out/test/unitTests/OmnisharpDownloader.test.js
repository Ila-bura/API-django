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
const OmnisharpDownloader_1 = require("../../src/omnisharp/OmnisharpDownloader");
const NetworkSettings_1 = require("../../src/NetworkSettings");
const EventStream_1 = require("../../src/EventStream");
const platform_1 = require("../../src/platform");
const CreateTmpAsset_1 = require("../../src/CreateTmpAsset");
const util = require("../../src/common");
const path = require("path");
const MockHttpsServer_1 = require("./testAssets/MockHttpsServer");
const chai_1 = require("chai");
const TestZip_1 = require("./testAssets/TestZip");
const TestFile_1 = require("./testAssets/TestFile");
const loggingEvents_1 = require("../../src/omnisharp/loggingEvents");
const TestEventBus_1 = require("./testAssets/TestEventBus");
const testAssets_1 = require("./testAssets/testAssets");
suite('OmnisharpDownloader', () => {
    const networkSettingsProvider = () => new NetworkSettings_1.default(undefined, false);
    let eventStream;
    const installPath = "somePath";
    let platformInfo = new platform_1.PlatformInformation("win32", "x86");
    let downloader;
    let server;
    let extensionPath;
    const version = "1.2.3";
    let tmpDir;
    let testZip;
    let eventBus;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        eventStream = new EventStream_1.EventStream();
        eventBus = new TestEventBus_1.default(eventStream);
        tmpDir = yield CreateTmpAsset_1.CreateTmpDir(true);
        extensionPath = tmpDir.name;
        downloader = new OmnisharpDownloader_1.OmnisharpDownloader(networkSettingsProvider, eventStream, testAssets_1.testPackageJSON, platformInfo, extensionPath);
        server = yield MockHttpsServer_1.default.CreateMockHttpsServer();
        testZip = yield TestZip_1.default.createTestZipAsync(TestFile_1.createTestFile("Foo", "foo.txt"));
        yield server.start();
        server.addRequestHandler('GET', `/releases/${version}/omnisharp-win-x86.zip`, 200, {
            "content-type": "application/zip",
            "content-length": testZip.size
        }, testZip.buffer);
    }));
    test('Returns false if request is made for a version that doesnot exist on the server', () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(yield downloader.DownloadAndInstallOmnisharp("1.00000001.0000", server.baseUrl, installPath)).to.be.false;
    }));
    test('Packages are downloaded and installed', () => __awaiter(void 0, void 0, void 0, function* () {
        yield downloader.DownloadAndInstallOmnisharp(version, server.baseUrl, installPath);
        for (let elem of testZip.files) {
            let filePath = path.join(extensionPath, installPath, version, elem.path);
            chai_1.expect(yield util.fileExists(filePath)).to.be.true;
        }
    }));
    test('Events are created', () => __awaiter(void 0, void 0, void 0, function* () {
        let expectedSequence = [
            new loggingEvents_1.PackageInstallation('OmniSharp Version = 1.2.3'),
            new loggingEvents_1.LogPlatformInfo(new platform_1.PlatformInformation("win32", "x86")),
            new loggingEvents_1.PackageInstallStart(),
            new loggingEvents_1.DownloadStart('OmniSharp for Windows (.NET 4.6 / x86), Version = 1.2.3'),
            new loggingEvents_1.DownloadSizeObtained(testZip.size),
            new loggingEvents_1.DownloadProgress(100, 'OmniSharp for Windows (.NET 4.6 / x86), Version = 1.2.3'),
            new loggingEvents_1.DownloadSuccess(' Done!'),
            new loggingEvents_1.InstallationStart('OmniSharp for Windows (.NET 4.6 / x86), Version = 1.2.3'),
            new loggingEvents_1.InstallationSuccess()
        ];
        chai_1.expect(eventBus.getEvents()).to.be.empty;
        yield downloader.DownloadAndInstallOmnisharp(version, server.baseUrl, installPath);
        chai_1.expect(eventBus.getEvents()).to.be.deep.equal(expectedSequence);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        tmpDir.dispose();
        yield server.stop();
        eventBus.dispose();
    }));
});
//# sourceMappingURL=OmnisharpDownloader.test.js.map