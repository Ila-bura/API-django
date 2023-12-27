"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const OmnisharpChannelObserver_1 = require("../../../src/observers/OmnisharpChannelObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite("OmnisharpChannelObserver", () => {
    let hasShown;
    let hasCleared;
    let preserveFocus;
    let vscode;
    let observer;
    setup(() => {
        hasShown = false;
        hasCleared = false;
        preserveFocus = false;
        vscode = Fakes_1.getVSCodeWithConfig();
        observer = new OmnisharpChannelObserver_1.OmnisharpChannelObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { show: (preserve) => {
                hasShown = true;
                preserveFocus = preserve;
            }, clear: () => { hasCleared = true; } }), vscode);
        Fakes_1.updateConfig(vscode, "csharp", "showOmnisharpLogOnError", true);
    });
    [
        new loggingEvents_1.OmnisharpFailure("errorMessage", new Error("error")),
        new loggingEvents_1.ShowOmniSharpChannel(),
        new loggingEvents_1.OmnisharpServerOnStdErr("std err")
    ].forEach((event) => {
        test(`${event.constructor.name}: Channel is shown and preserveFocus is set to true`, () => {
            chai_1.expect(hasShown).to.be.false;
            observer.post(event);
            chai_1.expect(hasShown).to.be.true;
            chai_1.expect(preserveFocus).to.be.true;
        });
    });
    test(`OmnisharpServerOnStdErr: Channel is not shown when disabled in configuration`, () => {
        Fakes_1.updateConfig(vscode, "csharp", "showOmnisharpLogOnError", false);
        chai_1.expect(hasShown).to.be.false;
        observer.post(new loggingEvents_1.OmnisharpServerOnStdErr("std err"));
        chai_1.expect(hasShown).to.be.false;
        chai_1.expect(preserveFocus).to.be.false;
    });
    [
        new loggingEvents_1.OmnisharpRestart()
    ].forEach((event) => {
        test(`${event.constructor.name}: Channel is cleared`, () => {
            chai_1.expect(hasCleared).to.be.false;
            observer.post(event);
            chai_1.expect(hasCleared).to.be.true;
        });
    });
});
//# sourceMappingURL=OmnisharpChannelObserver.test.js.map