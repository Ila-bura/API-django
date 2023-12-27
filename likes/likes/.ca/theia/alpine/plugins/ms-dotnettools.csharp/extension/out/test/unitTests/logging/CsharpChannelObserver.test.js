"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const CsharpChannelObserver_1 = require("../../../src/observers/CsharpChannelObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite("CsharpChannelObserver", () => {
    suiteSetup(() => chai_1.should());
    [
        new loggingEvents_1.InstallationFailure("someStage", "someError"),
        new loggingEvents_1.DebuggerNotInstalledFailure(),
        new loggingEvents_1.DebuggerPrerequisiteFailure("some failure"),
        new loggingEvents_1.ProjectJsonDeprecatedWarning(),
        new loggingEvents_1.IntegrityCheckFailure("", "", true),
        new loggingEvents_1.PackageInstallStart()
    ].forEach((event) => {
        test(`${event.constructor.name}: Channel is shown and preserve focus is set to true`, () => {
            let hasShown = false;
            let preserveFocus = false;
            let observer = new CsharpChannelObserver_1.CsharpChannelObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { show: (preserve) => {
                    hasShown = true;
                    preserveFocus = preserve;
                } }));
            observer.post(event);
            chai_1.expect(hasShown).to.be.true;
            chai_1.expect(preserveFocus).to.be.true;
        });
    });
});
//# sourceMappingURL=CsharpChannelObserver.test.js.map