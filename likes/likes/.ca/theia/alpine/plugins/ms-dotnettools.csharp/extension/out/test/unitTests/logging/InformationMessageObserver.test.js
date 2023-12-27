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
const InformationMessageObserver_1 = require("../../../src/observers/InformationMessageObserver");
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
chai_1.use(require('chai-as-promised'));
chai_1.use(require('chai-string'));
suite("InformationMessageObserver", () => {
    suiteSetup(() => chai_1.should());
    let doClickOk;
    let doClickCancel;
    let signalCommandDone;
    let commandDone;
    let vscode = getVsCode();
    let infoMessage;
    let invokedCommand;
    let observer = new InformationMessageObserver_1.InformationMessageObserver(vscode);
    setup(() => {
        infoMessage = undefined;
        invokedCommand = undefined;
        doClickCancel = undefined;
        doClickOk = undefined;
        commandDone = new Promise(resolve => {
            signalCommandDone = () => { resolve(); };
        });
    });
    [
        {
            event: Fakes_1.getUnresolvedDependenices("someFile"),
            expectedCommand: "dotnet.restore.all"
        }
    ].forEach((elem) => {
        suite(elem.event.constructor.name, () => {
            suite('Suppress Dotnet Restore Notification is true', () => {
                setup(() => Fakes_1.updateConfig(vscode, 'csharp', 'suppressDotnetRestoreNotification', true));
                test('The information message is not shown', () => {
                    observer.post(elem.event);
                    chai_1.expect(infoMessage).to.be.undefined;
                });
            });
            suite('Suppress Dotnet Restore Notification is false', () => {
                setup(() => Fakes_1.updateConfig(vscode, 'csharp', 'suppressDotnetRestoreNotification', false));
                test('The information message is shown', () => __awaiter(void 0, void 0, void 0, function* () {
                    observer.post(elem.event);
                    chai_1.expect(infoMessage).to.not.be.empty;
                    doClickOk();
                    yield commandDone;
                    chai_1.expect(invokedCommand).to.be.equal(elem.expectedCommand);
                }));
                test('Given an information message if the user clicks Restore, the command is executed', () => __awaiter(void 0, void 0, void 0, function* () {
                    observer.post(elem.event);
                    doClickOk();
                    yield commandDone;
                    chai_1.expect(invokedCommand).to.be.equal(elem.expectedCommand);
                }));
                test('Given an information message if the user clicks cancel, the command is not executed', () => __awaiter(void 0, void 0, void 0, function* () {
                    observer.post(elem.event);
                    doClickCancel();
                    yield chai_1.expect(rxjs_1.from(commandDone).pipe(operators_1.timeout(1)).toPromise()).to.be.rejected;
                    chai_1.expect(invokedCommand).to.be.undefined;
                }));
            });
        });
    });
    teardown(() => {
        commandDone = undefined;
    });
    function getVsCode() {
        let vscode = Fakes_1.getVSCodeWithConfig();
        vscode.window.showInformationMessage = (message, ...items) => __awaiter(this, void 0, void 0, function* () {
            infoMessage = message;
            return new Promise(resolve => {
                doClickCancel = () => {
                    resolve(undefined);
                };
                doClickOk = () => {
                    resolve(items[0]);
                };
            });
        });
        vscode.commands.executeCommand = (command, ...rest) => {
            invokedCommand = command;
            signalCommandDone();
            return undefined;
        };
        return vscode;
    }
});
//# sourceMappingURL=InformationMessageObserver.test.js.map