"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DotnetChannelObserver_1 = require("../../../src/observers/DotnetChannelObserver");
const Fakes_1 = require("../testAssets/Fakes");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite("DotnetChannelObserver", () => {
    suiteSetup(() => chai_1.should());
    let hasShown;
    let hasCleared;
    let observer = new DotnetChannelObserver_1.DotNetChannelObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { clear: () => { hasCleared = true; }, show: () => { hasShown = true; } }));
    setup(() => {
        hasShown = false;
        hasCleared = false;
    });
    test(`CommandDotNetRestoreStart : Clears and shows the channel`, () => {
        let event = new loggingEvents_1.CommandDotNetRestoreStart();
        observer.post(event);
        chai_1.expect(hasCleared).to.be.true;
        chai_1.expect(hasShown).to.be.true;
    });
});
//# sourceMappingURL=DotnetChannelObserver.test.js.map