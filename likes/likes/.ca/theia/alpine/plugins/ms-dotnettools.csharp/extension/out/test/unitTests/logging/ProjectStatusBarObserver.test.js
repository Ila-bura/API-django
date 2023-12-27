"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const ProjectStatusBarObserver_1 = require("../../../src/observers/ProjectStatusBarObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite('ProjectStatusBarObserver', () => {
    suiteSetup(() => chai_1.should());
    let showCalled;
    let hideCalled;
    let statusBarItem = {
        show: () => { showCalled = true; },
        hide: () => { hideCalled = true; }
    };
    let observer = new ProjectStatusBarObserver_1.ProjectStatusBarObserver(statusBarItem);
    setup(() => {
        showCalled = false;
        hideCalled = false;
    });
    test('OnServerStop: Status bar is hidden and the attributes are set to undefined', () => {
        let event = new loggingEvents_1.OmnisharpServerOnStop();
        observer.post(event);
        chai_1.expect(hideCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.be.undefined;
        chai_1.expect(statusBarItem.command).to.be.undefined;
        chai_1.expect(statusBarItem.color).to.be.undefined;
    });
    test('OnMultipleLaunchTargets: Status bar is shown with the select project option and the comand to pick a project', () => {
        let event = new loggingEvents_1.OmnisharpOnMultipleLaunchTargets([]);
        observer.post(event);
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.contain('Select project');
        chai_1.expect(statusBarItem.command).to.equal('o.pickProjectAndStart');
    });
    suite('WorkspaceInformationUpdated', () => {
        test('Project status is hidden if there is no MSBuild Object', () => {
            let event = Fakes_1.getWorkspaceInformationUpdated(null);
            observer.post(event);
            chai_1.expect(hideCalled).to.be.true;
            chai_1.expect(statusBarItem.text).to.be.undefined;
            chai_1.expect(statusBarItem.command).to.be.undefined;
        });
        test('Project status is shown if there is an MSBuild object', () => {
            let event = Fakes_1.getWorkspaceInformationUpdated(Fakes_1.getMSBuildWorkspaceInformation("somePath", []));
            observer.post(event);
            chai_1.expect(showCalled).to.be.true;
            chai_1.expect(statusBarItem.text).to.contain(event.info.MsBuild.SolutionPath);
            chai_1.expect(statusBarItem.command).to.equal('o.pickProjectAndStart');
        });
    });
});
//# sourceMappingURL=ProjectStatusBarObserver.test.js.map