"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const RazorLoggerObserver_1 = require("../../../src/observers/RazorLoggerObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
chai_1.use(require("chai-string"));
suite("RazorLoggerObserver", () => {
    suiteSetup(() => chai_1.should());
    let logOutput = "";
    let observer = new RazorLoggerObserver_1.RazorLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { logOutput += text; } }));
    setup(() => {
        logOutput = "";
    });
    test(`RazorPluginPathSpecified: Path is logged`, () => {
        let event = new loggingEvents_1.RazorPluginPathSpecified("somePath");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.path);
    });
    test(`RazorPluginPathDoesNotExist: Path is logged`, () => {
        let event = new loggingEvents_1.RazorPluginPathDoesNotExist("somePath");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.path);
    });
    test(`RazorDevModeActive: Logs dev mode active`, () => {
        let event = new loggingEvents_1.RazorDevModeActive();
        observer.post(event);
        chai_1.expect(logOutput).to.contain('Razor dev mode active');
    });
});
//# sourceMappingURL=RazorLoggerObserver.test.js.map