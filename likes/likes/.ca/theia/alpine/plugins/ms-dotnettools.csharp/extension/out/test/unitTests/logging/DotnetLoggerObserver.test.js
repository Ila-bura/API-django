"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const DotnetLoggerObserver_1 = require("../../../src/observers/DotnetLoggerObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite("DotnetLoggerObserver", () => {
    suiteSetup(() => chai_1.should());
    [
        new loggingEvents_1.CommandDotNetRestoreProgress("Some message"),
        new loggingEvents_1.CommandDotNetRestoreSucceeded("Some message"),
        new loggingEvents_1.CommandDotNetRestoreFailed("Some message")
    ].forEach((event) => {
        test(`${event.constructor.name}: Message is logged`, () => {
            let appendedMessage = "";
            let observer = new DotnetLoggerObserver_1.DotnetLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { appendedMessage += text; } }));
            observer.post(event);
            chai_1.expect(appendedMessage).to.contain(event.message);
        });
    });
});
//# sourceMappingURL=DotnetLoggerObserver.test.js.map