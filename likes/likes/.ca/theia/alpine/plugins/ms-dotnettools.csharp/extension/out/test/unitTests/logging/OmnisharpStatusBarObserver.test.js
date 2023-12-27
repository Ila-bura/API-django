"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const chai_1 = require("chai");
const OmnisharpStatusBarObserver_1 = require("../../../src/observers/OmnisharpStatusBarObserver");
suite('OmnisharpStatusBarObserver', () => {
    suiteSetup(() => chai_1.should());
    let showCalled;
    let hideCalled;
    setup(() => {
        statusBarItem.text = undefined;
        statusBarItem.color = undefined;
        statusBarItem.command = undefined;
        statusBarItem.tooltip = undefined;
        showCalled = false;
        hideCalled = false;
    });
    let statusBarItem = {
        show: () => { showCalled = true; },
        hide: () => { hideCalled = true; }
    };
    let observer = new OmnisharpStatusBarObserver_1.OmnisharpStatusBarObserver(statusBarItem);
    [
        new loggingEvents_1.OmnisharpServerOnServerError("someError"),
    ].forEach((event) => {
        test(`${event.constructor.name}: Status bar is shown with the error text`, () => {
            observer.post(event);
            chai_1.expect(showCalled).to.be.true;
            chai_1.expect(statusBarItem.text).to.equal(`$(flame)`);
            chai_1.expect(statusBarItem.command).to.equal('o.showOutput');
            chai_1.expect(statusBarItem.tooltip).to.equal('Error starting OmniSharp');
            chai_1.expect(statusBarItem.color).to.equal(OmnisharpStatusBarObserver_1.StatusBarColors.Red);
        });
    });
    test(`${loggingEvents_1.OmnisharpServerOnStdErr.name}: Status bar is shown with the error text`, () => {
        let event = new loggingEvents_1.OmnisharpServerOnStdErr("std error");
        observer.post(event);
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.color).to.equal(OmnisharpStatusBarObserver_1.StatusBarColors.Red);
        chai_1.expect(statusBarItem.text).to.equal(`$(flame)`);
        chai_1.expect(statusBarItem.command).to.equal('o.showOutput');
        chai_1.expect(statusBarItem.tooltip).to.contain(event.message);
    });
    test('OnBeforeServerInstall: Status bar is shown with the installation text', () => {
        let event = new loggingEvents_1.OmnisharpOnBeforeServerInstall();
        observer.post(event);
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.be.equal('$(flame) Installing OmniSharp...');
        chai_1.expect(statusBarItem.command).to.equal('o.showOutput');
    });
    test('OnBeforeServerStart: Status bar is shown with the starting text', () => {
        let event = new loggingEvents_1.OmnisharpOnBeforeServerStart();
        observer.post(event);
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.color).to.equal(OmnisharpStatusBarObserver_1.StatusBarColors.Yellow);
        chai_1.expect(statusBarItem.text).to.be.equal('$(flame)');
        chai_1.expect(statusBarItem.command).to.equal('o.showOutput');
        chai_1.expect(statusBarItem.tooltip).to.equal('Starting OmniSharp server');
    });
    test('OnServerStart: Status bar is shown with the flame and "Running" text', () => {
        let event = new loggingEvents_1.OmnisharpServerOnStart();
        observer.post(event);
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.be.equal('$(flame)');
        chai_1.expect(statusBarItem.command).to.equal('o.showOutput');
        chai_1.expect(statusBarItem.tooltip).to.be.equal('OmniSharp server is running');
    });
    test('OnServerStop: Status bar is hidden and the attributes are set to undefined', () => {
        let event = new loggingEvents_1.OmnisharpServerOnStop();
        observer.post(event);
        chai_1.expect(hideCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.be.undefined;
        chai_1.expect(statusBarItem.command).to.be.undefined;
        chai_1.expect(statusBarItem.color).to.be.undefined;
    });
    test('DownloadStart: Text and tooltip are set ', () => {
        let event = new loggingEvents_1.DownloadStart("somePackage");
        observer.post(event);
        chai_1.expect(statusBarItem.text).to.contain("Downloading packages");
        chai_1.expect(statusBarItem.tooltip).to.contain(event.packageDescription);
    });
    test('InstallationProgress: Text and tooltip are set', () => {
        let event = new loggingEvents_1.InstallationStart("somePackage");
        observer.post(event);
        chai_1.expect(statusBarItem.text).to.contain("Installing packages");
        chai_1.expect(statusBarItem.tooltip).to.contain(event.packageDescription);
    });
    test('DownloadProgress: Tooltip contains package description and download percentage', () => {
        let event = new loggingEvents_1.DownloadProgress(50, "somePackage");
        observer.post(event);
        chai_1.expect(statusBarItem.tooltip).to.contain(event.packageDescription);
        chai_1.expect(statusBarItem.tooltip).to.contain(event.downloadPercentage);
    });
    test('InstallationSuccess: Status bar is hidden and the attributes are set to undefined', () => {
        let installationEvent = new loggingEvents_1.InstallationStart("somePackage");
        observer.post(installationEvent);
        let successEvent = new loggingEvents_1.InstallationSuccess();
        observer.post(successEvent);
        chai_1.expect(hideCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.be.undefined;
        chai_1.expect(statusBarItem.command).to.be.undefined;
        chai_1.expect(statusBarItem.color).to.be.undefined;
    });
});
//# sourceMappingURL=OmnisharpStatusBarObserver.test.js.map