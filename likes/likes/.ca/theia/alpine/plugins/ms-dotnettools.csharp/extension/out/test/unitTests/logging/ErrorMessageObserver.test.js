"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const ErrorMessageObserver_1 = require("../../../src/observers/ErrorMessageObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
chai_1.use(require('chai-as-promised'));
chai_1.use(require('chai-string'));
suite("ErrorMessageObserver", () => {
    suiteSetup(() => chai_1.should());
    let vscode = Fakes_1.getFakeVsCode();
    let errorMessage;
    let observer = new ErrorMessageObserver_1.ErrorMessageObserver(vscode);
    vscode.window.showErrorMessage = (message, ...items) => __awaiter(void 0, void 0, void 0, function* () {
        errorMessage = message;
        return Promise.resolve("Done");
    });
    setup(() => {
        errorMessage = undefined;
    });
    [
        new loggingEvents_1.ZipError("This is an error"),
        new loggingEvents_1.DotNetTestRunFailure("This is a failure message"),
        new loggingEvents_1.DotNetTestDebugStartFailure("Start failure")
    ].forEach((event) => {
        test(`${event.constructor.name}: Error message is shown`, () => {
            observer.post(event);
            chai_1.expect(errorMessage).to.be.contain(event.message);
        });
    });
    suite(`${loggingEvents_1.IntegrityCheckFailure.name}`, () => {
        test("Package Description and url are logged when we are not retrying", () => {
            let description = 'someDescription';
            let url = 'someUrl';
            let event = new loggingEvents_1.IntegrityCheckFailure(description, url, false);
            observer.post(event);
            chai_1.expect(errorMessage).to.contain(description);
            chai_1.expect(errorMessage).to.contain(url);
        });
        test("Nothing is shown if we are retrying", () => {
            let description = 'someDescription';
            let url = 'someUrl';
            let event = new loggingEvents_1.IntegrityCheckFailure(description, url, true);
            observer.post(event);
            chai_1.expect(errorMessage).to.be.undefined;
        });
    });
});
//# sourceMappingURL=ErrorMessageObserver.test.js.map