"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const DotnetTestChannelObserver_1 = require("../../../src/observers/DotnetTestChannelObserver");
suite("DotnetTestChannelObserver", () => {
    let hasShown;
    let preserveFocus;
    let observer = new DotnetTestChannelObserver_1.default(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { show: (preserve) => {
            hasShown = true;
            preserveFocus = preserve;
        } }));
    setup(() => {
        hasShown = false;
    });
    [
        new loggingEvents_1.DotNetTestRunStart("foo"),
        new loggingEvents_1.DotNetTestRunFailure("some failure"),
        new loggingEvents_1.DotNetTestsInClassRunStart("someclass"),
        new loggingEvents_1.DotNetTestDebugStart("foo"),
        new loggingEvents_1.DotNetTestsInClassDebugStart("someclass")
    ].forEach((event) => {
        test(`${event.constructor.name}: Channel is shown and preserve focus is set to true`, () => {
            chai_1.expect(hasShown).to.be.false;
            observer.post(event);
            chai_1.expect(hasShown).to.be.true;
            chai_1.expect(preserveFocus).to.be.true;
        });
    });
});
//# sourceMappingURL=DotnetTestChannelObserver.test.js.map