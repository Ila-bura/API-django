"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const BackgroundWorkStatusBarObserver_1 = require("../../../src/observers/BackgroundWorkStatusBarObserver");
const protocol_1 = require("../../../src/omnisharp/protocol");
suite('BackgroundWorkStatusBarObserver', () => {
    suiteSetup(() => chai_1.should());
    let showCalled;
    let hideCalled;
    let statusBarItem = {
        show: () => { showCalled = true; },
        hide: () => { hideCalled = true; }
    };
    let observer = new BackgroundWorkStatusBarObserver_1.BackgroundWorkStatusBarObserver(statusBarItem);
    setup(() => {
        showCalled = false;
        hideCalled = false;
    });
    test('OmnisharpProjectDiagnosticStatus.Processing: Show processing message', () => {
        let event = new loggingEvents_1.OmnisharpProjectDiagnosticStatus({ Status: protocol_1.DiagnosticStatus.Processing, ProjectFilePath: "foo.csproj", Type: "background" });
        observer.post(event);
        chai_1.expect(hideCalled).to.be.false;
        chai_1.expect(showCalled).to.be.true;
        chai_1.expect(statusBarItem.text).to.contain('Analyzing');
    });
    test('OmnisharpProjectDiagnosticStatus.Ready: Hide processing message', () => {
        let event = new loggingEvents_1.OmnisharpProjectDiagnosticStatus({ Status: protocol_1.DiagnosticStatus.Ready, ProjectFilePath: "foo.csproj", Type: "background" });
        observer.post(event);
        chai_1.expect(hideCalled).to.be.true;
        chai_1.expect(showCalled).to.be.false;
        chai_1.expect(statusBarItem.text).to.be.undefined;
    });
});
//# sourceMappingURL=BackgroundWorkStatusBarObserver.test.js.map