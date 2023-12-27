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
const path = require("path");
const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");
const util = require("../../../src/common");
const CreateTmpAsset_1 = require("../../../src/CreateTmpAsset");
const TestZip_1 = require("../testAssets/TestZip");
const downloadAndInstallPackages_1 = require("../../../src/packageManager/downloadAndInstallPackages");
const NetworkSettings_1 = require("../../../src/NetworkSettings");
const EventStream_1 = require("../../../src/EventStream");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const MockHttpsServer_1 = require("../testAssets/MockHttpsServer");
const TestFile_1 = require("../testAssets/TestFile");
const TestEventBus_1 = require("../testAssets/TestEventBus");
const AbsolutePath_1 = require("../../../src/packageManager/AbsolutePath");
chai.use(chaiAsPromised);
let expect = chai.expect;
suite(`${downloadAndInstallPackages_1.downloadAndInstallPackages.name}`, () => {
    let tmpInstallDir;
    let server;
    let testZip;
    let tmpDirPath;
    let eventStream;
    let eventBus;
    let downloadablePackage;
    let notDownloadablePackage;
    let downloadValidator = () => true;
    const packageDescription = "Test Package";
    const networkSettingsProvider = () => new NetworkSettings_1.default(undefined, false);
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        eventStream = new EventStream_1.EventStream();
        server = yield MockHttpsServer_1.default.CreateMockHttpsServer();
        eventBus = new TestEventBus_1.default(eventStream);
        tmpInstallDir = yield CreateTmpAsset_1.CreateTmpDir(true);
        tmpDirPath = tmpInstallDir.name;
        downloadablePackage = [
            {
                url: `${server.baseUrl}/downloadablePackage`,
                description: packageDescription,
                installPath: new AbsolutePath_1.AbsolutePath(tmpDirPath),
            }
        ];
        notDownloadablePackage = [
            {
                url: `${server.baseUrl}/notDownloadablePackage`,
                description: packageDescription,
                installPath: new AbsolutePath_1.AbsolutePath(tmpDirPath)
            }
        ];
        testZip = yield TestZip_1.default.createTestZipAsync(TestFile_1.createTestFile("Foo", "foo.txt"));
        yield server.start();
        server.addRequestHandler('GET', '/downloadablePackage', 200, {
            "content-type": "application/zip",
            "content-length": testZip.size
        }, testZip.buffer);
        server.addRequestHandler('GET', '/notDownloadablePackage', 404);
    }));
    suite("If the download and install succeeds", () => {
        test("The expected files are installed at the specified path", () => __awaiter(void 0, void 0, void 0, function* () {
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(downloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            for (let elem of testZip.files) {
                let filePath = path.join(tmpDirPath, elem.path);
                expect(yield util.fileExists(filePath)).to.be.true;
            }
        }));
        test("install.Lock is present", () => __awaiter(void 0, void 0, void 0, function* () {
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(downloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            expect(yield util.fileExists(path.join(tmpDirPath, "install.Lock"))).to.be.true;
        }));
        test("Events are created in the correct order", () => __awaiter(void 0, void 0, void 0, function* () {
            let eventsSequence = [
                new loggingEvents_1.PackageInstallStart(),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadSizeObtained(testZip.size),
                new loggingEvents_1.DownloadProgress(100, packageDescription),
                new loggingEvents_1.DownloadSuccess(' Done!'),
                new loggingEvents_1.InstallationStart(packageDescription)
            ];
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(downloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            expect(eventBus.getEvents()).to.be.deep.equal(eventsSequence);
        }));
        test("If the download validation fails for the first time and passed second time, the correct events are logged", () => __awaiter(void 0, void 0, void 0, function* () {
            let count = 1;
            let downloadValidator = () => {
                if (count > 1) {
                    return true; // fail the first time and then pass the subsequent times
                }
                count++;
                return false;
            };
            let eventsSequence = [
                new loggingEvents_1.PackageInstallStart(),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadSizeObtained(testZip.size),
                new loggingEvents_1.DownloadProgress(100, packageDescription),
                new loggingEvents_1.DownloadSuccess(' Done!'),
                new loggingEvents_1.IntegrityCheckFailure(packageDescription, downloadablePackage[0].url, true),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadSizeObtained(testZip.size),
                new loggingEvents_1.DownloadProgress(100, packageDescription),
                new loggingEvents_1.DownloadSuccess(' Done!'),
                new loggingEvents_1.InstallationStart(packageDescription)
            ];
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(downloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            expect(eventBus.getEvents()).to.be.deep.equal(eventsSequence);
        }));
    });
    suite("If the download and install fails", () => {
        test("If the download succeeds but the validation fails, events are logged", () => __awaiter(void 0, void 0, void 0, function* () {
            let downloadValidator = () => false;
            let eventsSequence = [
                new loggingEvents_1.PackageInstallStart(),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadSizeObtained(testZip.size),
                new loggingEvents_1.DownloadProgress(100, packageDescription),
                new loggingEvents_1.DownloadSuccess(' Done!'),
                new loggingEvents_1.IntegrityCheckFailure(packageDescription, downloadablePackage[0].url, true),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadSizeObtained(testZip.size),
                new loggingEvents_1.DownloadProgress(100, packageDescription),
                new loggingEvents_1.DownloadSuccess(' Done!'),
                new loggingEvents_1.IntegrityCheckFailure(packageDescription, downloadablePackage[0].url, false),
            ];
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(downloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            expect(eventBus.getEvents()).to.be.deep.equal(eventsSequence);
        }));
        test("Returns false when the download fails", () => __awaiter(void 0, void 0, void 0, function* () {
            let eventsSequence = [
                new loggingEvents_1.PackageInstallStart(),
                new loggingEvents_1.DownloadStart(packageDescription),
                new loggingEvents_1.DownloadFailure(`Failed to download from ${notDownloadablePackage[0].url}. Error code '404')`),
            ];
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(notDownloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            let obtainedEvents = eventBus.getEvents();
            expect(obtainedEvents[0]).to.be.deep.equal(eventsSequence[0]);
            expect(obtainedEvents[1]).to.be.deep.equal(eventsSequence[1]);
            expect(obtainedEvents[2]).to.be.deep.equal(eventsSequence[2]);
            let installationFailureEvent = obtainedEvents[3];
            expect(installationFailureEvent.stage).to.be.equal("downloadPackage");
            expect(installationFailureEvent.error).to.not.be.null;
        }));
        test("install.Lock is not present when the download fails", () => __awaiter(void 0, void 0, void 0, function* () {
            yield downloadAndInstallPackages_1.downloadAndInstallPackages(notDownloadablePackage, networkSettingsProvider, eventStream, downloadValidator);
            expect(yield util.fileExists(path.join(tmpDirPath, "install.Lock"))).to.be.false;
        }));
    });
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        if (tmpInstallDir) {
            tmpInstallDir.dispose();
        }
        yield server.stop();
        eventBus.dispose();
    }));
});
//# sourceMappingURL=downloadAndInstallPackages.test.js.map