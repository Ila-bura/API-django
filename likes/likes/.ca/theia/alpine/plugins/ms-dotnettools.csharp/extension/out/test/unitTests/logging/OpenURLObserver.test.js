"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const OpenURLObserver_1 = require("../../../src/observers/OpenURLObserver");
const Fakes_1 = require("../testAssets/Fakes");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const chai_1 = require("chai");
suite(`${OpenURLObserver_1.OpenURLObserver.name}`, () => {
    let observer;
    let vscode;
    let valueToBeParsed;
    const url = "someUrl";
    let openExternalCalled;
    setup(() => {
        vscode = Fakes_1.getFakeVsCode();
        openExternalCalled = false;
        valueToBeParsed = undefined;
        vscode.env.openExternal = (target) => {
            openExternalCalled = true;
            return undefined;
        };
        vscode.Uri.parse = (value) => {
            valueToBeParsed = value;
            return undefined;
        };
        observer = new OpenURLObserver_1.OpenURLObserver(vscode);
    });
    test("openExternal function is called and the url is passed through the vscode.Uri.parse function", () => {
        let event = new loggingEvents_1.OpenURL(url);
        observer.post(event);
        chai_1.expect(valueToBeParsed).to.be.equal(url);
        chai_1.expect(openExternalCalled).to.be.true;
    });
});
//# sourceMappingURL=OpenURLObserver.test.js.map