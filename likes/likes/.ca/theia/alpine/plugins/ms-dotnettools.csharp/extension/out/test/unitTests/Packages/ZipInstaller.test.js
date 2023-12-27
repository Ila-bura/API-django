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
const fs = require("async-file");
const path = require("path");
const chai = require("chai");
const util = require("../../../src/common");
const CreateTmpAsset_1 = require("../../../src/CreateTmpAsset");
const ZipInstaller_1 = require("../../../src/packageManager/ZipInstaller");
const EventStream_1 = require("../../../src/EventStream");
const platform_1 = require("../../../src/platform");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const TestFile_1 = require("../testAssets/TestFile");
const TestZip_1 = require("../testAssets/TestZip");
const TestEventBus_1 = require("../testAssets/TestEventBus");
const AbsolutePath_1 = require("../../../src/packageManager/AbsolutePath");
chai.use(require("chai-as-promised"));
let expect = chai.expect;
suite('ZipInstaller', () => {
    const binaries = [
        TestFile_1.createTestFile("binary1", "binary1.txt"),
        TestFile_1.createTestFile("binary2", "binary2.txt")
    ];
    const files = [
        TestFile_1.createTestFile("file1", "file1.txt"),
        TestFile_1.createTestFile("file2", "folder/file2.txt")
    ];
    let tmpInstallDir;
    let installationPath;
    let testZip;
    const fileDescription = "somefile";
    let eventStream;
    let eventBus;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        eventStream = new EventStream_1.EventStream();
        eventBus = new TestEventBus_1.default(eventStream);
        tmpInstallDir = yield CreateTmpAsset_1.CreateTmpDir(true);
        installationPath = new AbsolutePath_1.AbsolutePath(tmpInstallDir.name);
        testZip = yield TestZip_1.default.createTestZipAsync(...files, ...binaries);
        util.setExtensionPath(tmpInstallDir.name);
    }));
    test('The folder is unzipped and all the files are present at the expected paths', () => __awaiter(void 0, void 0, void 0, function* () {
        yield ZipInstaller_1.InstallZip(testZip.buffer, fileDescription, installationPath, [], eventStream);
        for (let elem of testZip.files) {
            let filePath = path.join(installationPath.value, elem.path);
            expect(yield util.fileExists(filePath)).to.be.true;
        }
    }));
    test('The folder is unzipped and all the expected events are created', () => __awaiter(void 0, void 0, void 0, function* () {
        yield ZipInstaller_1.InstallZip(testZip.buffer, fileDescription, installationPath, [], eventStream);
        let eventSequence = [
            new loggingEvents_1.InstallationStart(fileDescription)
        ];
        expect(eventBus.getEvents()).to.be.deep.equal(eventSequence);
    }));
    test('The folder is unzipped and the binaries have the expected permissions(except on Windows)', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!((yield platform_1.PlatformInformation.GetCurrent()).isWindows())) {
            let absoluteBinaries = binaries.map(binary => AbsolutePath_1.AbsolutePath.getAbsolutePath(installationPath.value, binary.path));
            yield ZipInstaller_1.InstallZip(testZip.buffer, fileDescription, installationPath, absoluteBinaries, eventStream);
            for (let binaryPath of absoluteBinaries) {
                expect(yield util.fileExists(binaryPath.value)).to.be.true;
                let mode = (yield fs.stat(binaryPath.value)).mode;
                expect(mode & 0o7777).to.be.equal(0o755, `Expected mode for path ${binaryPath}`);
            }
        }
    }));
    test('Error is thrown when the buffer contains an invalid zip', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(ZipInstaller_1.InstallZip(Buffer.from("My file", "utf8"), "Text File", installationPath, [], eventStream)).to.be.rejected;
    }));
    test('Error event is created when the buffer contains an invalid zip', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield ZipInstaller_1.InstallZip(Buffer.from("some content", "utf8"), "Text File", installationPath, [], eventStream);
        }
        catch (_a) {
            let eventSequence = [
                new loggingEvents_1.InstallationStart("Text File"),
                new loggingEvents_1.ZipError("C# Extension was unable to download its dependencies. Please check your internet connection. If you use a proxy server, please visit https://aka.ms/VsCodeCsharpNetworking")
            ];
            expect(eventBus.getEvents()).to.be.deep.equal(eventSequence);
        }
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        if (tmpInstallDir) {
            tmpInstallDir.dispose();
        }
        eventBus.dispose();
    }));
});
//# sourceMappingURL=ZipInstaller.test.js.map