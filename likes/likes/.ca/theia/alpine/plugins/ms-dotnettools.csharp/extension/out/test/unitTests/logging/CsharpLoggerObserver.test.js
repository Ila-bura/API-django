"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const CsharpLoggerObserver_1 = require("../../../src/observers/CsharpLoggerObserver");
const platform_1 = require("../../../src/platform");
const Event = require("../../../src/omnisharp/loggingEvents");
const PackageError_1 = require("../../../src/packageManager/PackageError");
suite("CsharpLoggerObserver", () => {
    suiteSetup(() => chai_1.should());
    let logOutput = "";
    let observer = new CsharpLoggerObserver_1.CsharpLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { logOutput += text || ""; } }));
    setup(() => {
        logOutput = "";
    });
    test('PlatformInfo: Logs contain the Platform and Architecture', () => {
        let event = new Event.LogPlatformInfo(new platform_1.PlatformInformation("MyPlatform", "MyArchitecture"));
        observer.post(event);
        chai_1.expect(logOutput).to.contain("MyPlatform");
        chai_1.expect(logOutput).to.contain("MyArchitecture");
    });
    suite("InstallationFailure", () => {
        test('Stage and Error is logged if not a PackageError', () => {
            let event = new Event.InstallationFailure("someStage", new Error("someError"));
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.stage);
            chai_1.expect(logOutput).to.contain(event.error.toString());
        });
        test('Stage and Error is logged if a PackageError without inner error', () => {
            let event = new Event.InstallationFailure("someStage", new PackageError_1.PackageError("someError", null, null));
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.stage);
            chai_1.expect(logOutput).to.contain(event.error.message);
        });
        test('Stage and Inner error is logged if a PackageError without inner error', () => {
            let event = new Event.InstallationFailure("someStage", new PackageError_1.PackageError("someError", null, "innerError"));
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.stage);
            chai_1.expect(logOutput).to.contain(event.error.innerError.toString());
        });
    });
    suite('Download', () => {
        let packageName = "somePackage";
        [
            {
                events: [],
                expected: ""
            },
            {
                events: [new Event.DownloadStart("somePackage")],
                expected: "Downloading package 'somePackage' "
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(500), new Event.DownloadProgress(100, packageName)],
                expected: "Downloading package 'somePackage' (1 KB)...................."
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(500), new Event.DownloadProgress(10, packageName), new Event.DownloadProgress(50, packageName), new Event.DownloadProgress(100, packageName)],
                expected: "Downloading package 'somePackage' (1 KB)...................."
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(500), new Event.DownloadProgress(10, packageName), new Event.DownloadProgress(50, packageName)],
                expected: "Downloading package 'somePackage' (1 KB).........."
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(2000), new Event.DownloadProgress(50, packageName)],
                expected: "Downloading package 'somePackage' (2 KB).........."
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(2000), new Event.DownloadProgress(50, packageName), new Event.DownloadProgress(50, packageName), new Event.DownloadProgress(50, packageName)],
                expected: "Downloading package 'somePackage' (2 KB).........."
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(3000), new Event.DownloadProgress(100, packageName), new Event.DownloadSuccess("Done")],
                expected: "Downloading package 'somePackage' (3 KB)....................Done\n"
            },
            {
                events: [new Event.DownloadStart("somePackage"), new Event.DownloadSizeObtained(4000), new Event.DownloadProgress(50, packageName), new Event.DownloadFailure("Failed")],
                expected: "Downloading package 'somePackage' (4 KB)..........Failed\n"
            }
        ].forEach((element) => {
            test(`Prints the download status to the logger as ${element.expected}`, () => {
                let logOutput = "";
                let observer = new CsharpLoggerObserver_1.CsharpLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { appendLine: (text) => { logOutput += `${text}\n`; }, append: (text) => { logOutput += text; } }));
                element.events.forEach((message) => observer.post(message));
                chai_1.expect(logOutput).to.be.equal(element.expected);
            });
        });
    });
    [
        {
            message: new Event.DebuggerPrerequisiteFailure('Some failure message'),
            expected: `Some failure message`
        },
        {
            message: new Event.DebuggerPrerequisiteWarning("Some warning message"),
            expected: `Some warning message`
        }
    ].forEach((element) => test(`${element.message.constructor.name} is shown`, () => {
        observer.post(element.message);
        chai_1.expect(logOutput).to.contain(element.expected);
    }));
    test(`ActivationFailure: Some message is logged`, () => {
        let event = new Event.ActivationFailure();
        observer.post(event);
        chai_1.expect(logOutput).to.not.be.empty;
    });
    test(`ProjectJsonDeprecatedWarning: Some message is logged`, () => {
        let event = new Event.ProjectJsonDeprecatedWarning();
        observer.post(event);
        chai_1.expect(logOutput).to.not.be.empty;
    });
    test(`InstallationSuccess: Some message is logged`, () => {
        let event = new Event.InstallationSuccess();
        observer.post(event);
        chai_1.expect(logOutput).to.not.be.empty;
    });
    test(`InstallationProgress: Progress message is logged`, () => {
        let event = new Event.InstallationStart("somPackage");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.packageDescription);
    });
    test('PackageInstallation: Package name is logged', () => {
        let event = new Event.PackageInstallation("somePackage");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.packageInfo);
    });
    test('DownloadFallBack: The fallbackurl is logged', () => {
        let event = new Event.DownloadFallBack("somrurl");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.fallbackUrl);
    });
    test(`${Event.IntegrityCheckFailure.name}: Package Description is logged when we are retrying`, () => {
        let description = 'someDescription';
        let url = 'someUrl';
        let event = new Event.IntegrityCheckFailure(description, url, true);
        observer.post(event);
        chai_1.expect(logOutput).to.contain(description);
    });
    test(`${Event.IntegrityCheckFailure.name}: Package Description and url are logged when we are not retrying`, () => {
        let description = 'someDescription';
        let url = 'someUrl';
        let event = new Event.IntegrityCheckFailure(description, url, false);
        observer.post(event);
        chai_1.expect(logOutput).to.contain(description);
        chai_1.expect(logOutput).to.contain(url);
    });
    test(`${Event.IntegrityCheckSuccess.name}: Some message is logged`, () => {
        let event = new Event.IntegrityCheckSuccess();
        observer.post(event);
        chai_1.expect(logOutput).to.not.be.empty;
    });
});
//# sourceMappingURL=CsharpLoggerObserver.test.js.map