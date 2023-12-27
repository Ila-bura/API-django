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
const WarningMessageObserver_1 = require("../../../src/observers/WarningMessageObserver");
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const testing_1 = require("rxjs/testing");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
chai_1.use(require('chai-as-promised'));
chai_1.use(require('chai-string'));
suite('WarningMessageObserver', () => {
    suiteSetup(() => chai_1.should());
    let doClickOk;
    let doClickCancel;
    let signalCommandDone;
    let commandDone = new Promise(resolve => {
        signalCommandDone = () => { resolve(); };
    });
    let warningMessages;
    let invokedCommand;
    let scheduler;
    let assertionObservable;
    let observer;
    let vscode = Fakes_1.getFakeVsCode();
    vscode.window.showWarningMessage = (message, ...items) => __awaiter(void 0, void 0, void 0, function* () {
        warningMessages.push(message);
        assertionObservable.next(`[${warningMessages.length}] ${message}`);
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
    setup(() => {
        assertionObservable = new rxjs_1.Subject();
        scheduler = new testing_1.TestScheduler(chai_1.assert.deepEqual);
        scheduler.maxFrames = 9000;
        observer = new WarningMessageObserver_1.WarningMessageObserver(vscode, () => false, scheduler);
        warningMessages = [];
        invokedCommand = undefined;
        commandDone = new Promise(resolve => {
            signalCommandDone = () => { resolve(); };
        });
    });
    test('OmnisharpServerMsBuildProjectDiagnostics: No action is taken if the errors array is empty', () => {
        let event = Fakes_1.getOmnisharpMSBuildProjectDiagnosticsEvent("someFile", [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 0, 0, 0, 0)], []);
        let marble = `a`;
        let marble_event_map = { a: event };
        let eventList = scheduler.createHotObservable(marble, marble_event_map);
        eventList.subscribe(e => observer.post(e));
        scheduler.flush();
        chai_1.expect(warningMessages).to.be.empty;
        chai_1.expect(invokedCommand).to.be.undefined;
    });
    test('OmnisharpServerMsBuildProjectDiagnostics: No event is posted if warning is disabled', () => {
        let newObserver = new WarningMessageObserver_1.WarningMessageObserver(vscode, () => true, scheduler);
        let event = Fakes_1.getOmnisharpMSBuildProjectDiagnosticsEvent("someFile", [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 0, 0, 0, 0)], [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 0, 0, 0, 0)]);
        let marble = `a`;
        let marble_event_map = { a: event };
        let eventList = scheduler.createHotObservable(marble, marble_event_map);
        eventList.subscribe(e => newObserver.post(e));
        scheduler.flush();
        chai_1.expect(warningMessages).to.be.empty;
        chai_1.expect(invokedCommand).to.be.undefined;
    });
    [
        {
            eventA: Fakes_1.getOmnisharpMSBuildProjectDiagnosticsEvent("someFile", [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 1, 2, 3, 4)], [Fakes_1.getMSBuildDiagnosticsMessage("errorFile", "", "", 5, 6, 7, 8)]),
            eventB: Fakes_1.getOmnisharpMSBuildProjectDiagnosticsEvent("BFile", [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 1, 2, 3, 4)], [Fakes_1.getMSBuildDiagnosticsMessage("errorFile", "", "", 5, 6, 7, 8)]),
            eventC: Fakes_1.getOmnisharpMSBuildProjectDiagnosticsEvent("CFile", [Fakes_1.getMSBuildDiagnosticsMessage("warningFile", "", "", 1, 2, 3, 4)], [Fakes_1.getMSBuildDiagnosticsMessage("errorFile", "", "", 5, 6, 7, 8)]),
            assertion1: '[1] Some projects have trouble loading. Please review the output for more details.',
            assertion2: '[2] Some projects have trouble loading. Please review the output for more details.',
            expected: "Some projects have trouble loading. Please review the output for more details.",
            command: "o.showOutput"
        },
        {
            eventA: Fakes_1.getOmnisharpServerOnErrorEvent("someText1", "someFile1", 1, 2),
            eventB: Fakes_1.getOmnisharpServerOnErrorEvent("someText2", "someFile2", 1, 2),
            eventC: Fakes_1.getOmnisharpServerOnErrorEvent("someText3", "someFile3", 1, 2),
            assertion1: '[1] Some projects have trouble loading. Please review the output for more details.',
            assertion2: '[2] Some projects have trouble loading. Please review the output for more details.',
            expected: "Some projects have trouble loading. Please review the output for more details.",
            command: "o.showOutput"
        }
    ].forEach(elem => {
        suite(`${elem.eventA.constructor.name}`, () => {
            test(`When the event is fired then a warning message is displayed`, () => {
                let marble = `${timeToMarble(1500)}a`;
                let marble_event_map = { a: elem.eventA };
                let eventList = scheduler.createHotObservable(marble, marble_event_map);
                eventList.subscribe(e => observer.post(e));
                scheduler.expectObservable(assertionObservable).toBe(`${timeToMarble(3000)}a`, { a: elem.assertion1 });
                scheduler.flush();
                chai_1.expect(warningMessages.length).to.be.equal(1);
                chai_1.expect(warningMessages[0]).to.be.equal(elem.expected);
            });
            test(`When events are fired rapidly, then they are debounced by 1500 ms`, () => {
                let marble = `${timeToMarble(1000)}a${timeToMarble(500)}b${timeToMarble(500)}c`;
                let marble_event_map = { a: elem.eventA, b: elem.eventB, c: elem.eventC };
                let eventList = scheduler.createHotObservable(marble, marble_event_map);
                eventList.subscribe(e => observer.post(e));
                scheduler.expectObservable(assertionObservable).toBe(`${timeToMarble(3520)}a`, { a: elem.assertion1 });
                scheduler.flush();
                chai_1.expect(warningMessages.length).to.be.equal(1);
                chai_1.expect(warningMessages[0]).to.be.equal(elem.expected);
            });
            test(`When events are 1500 ms apart, then they are not debounced`, () => {
                let marble = `${timeToMarble(1000)}a${timeToMarble(490)}b${timeToMarble(1500)}c`;
                let marble_event_map = { a: elem.eventA, b: elem.eventB, c: elem.eventC };
                let eventList = scheduler.createHotObservable(marble, marble_event_map);
                eventList.subscribe(e => observer.post(e));
                scheduler.expectObservable(assertionObservable).toBe(`${timeToMarble(3000)}a${timeToMarble(1500)}b`, {
                    a: elem.assertion1,
                    b: elem.assertion2
                });
                scheduler.flush();
                chai_1.expect(warningMessages.length).to.be.equal(2);
                chai_1.expect(warningMessages[0]).to.be.equal(elem.expected);
            });
            test(`Given a warning message, when the user clicks ok the command is executed`, () => __awaiter(void 0, void 0, void 0, function* () {
                let marble = `${timeToMarble(1500)}a`;
                let eventList = scheduler.createHotObservable(marble, { a: elem.eventA });
                scheduler.expectObservable(eventList.pipe(operators_1.map(e => observer.post(e))));
                scheduler.flush();
                doClickOk();
                yield commandDone;
                chai_1.expect(invokedCommand).to.be.equal(elem.command);
            }));
            test(`Given a warning message, when the user clicks cancel the command is not executed`, () => __awaiter(void 0, void 0, void 0, function* () {
                let marble = `${timeToMarble(1500)}a--|`;
                let eventList = scheduler.createHotObservable(marble, { a: elem.eventA });
                scheduler.expectObservable(eventList.pipe(operators_1.map(e => observer.post(e))));
                scheduler.flush();
                doClickCancel();
                yield chai_1.expect(rxjs_1.from(commandDone).pipe(operators_1.timeout(1)).toPromise()).to.be.rejected;
                chai_1.expect(invokedCommand).to.be.undefined;
            }));
        });
    });
});
function timeToMarble(timeinMilliseconds) {
    let marble = "";
    for (let i = 0; i < (timeinMilliseconds / 10); i++) {
        marble += "-";
    }
    return marble;
}
//# sourceMappingURL=WarningMessageObserver.test.js.map