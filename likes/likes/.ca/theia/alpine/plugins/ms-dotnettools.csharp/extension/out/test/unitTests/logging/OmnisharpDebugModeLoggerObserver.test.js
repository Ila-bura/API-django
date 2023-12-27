"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const OmnisharpDebugModeLoggerObserver_1 = require("../../../src/observers/OmnisharpDebugModeLoggerObserver");
chai_1.use(require("chai-string"));
suite("OmnisharpDebugModeLoggerObserver", () => {
    suiteSetup(() => chai_1.should());
    let logOutput = "";
    let observer = new OmnisharpDebugModeLoggerObserver_1.OmnisharpDebugModeLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { logOutput += text; } }));
    setup(() => {
        logOutput = "";
    });
    [
        new loggingEvents_1.OmnisharpServerVerboseMessage("server verbose message")
    ].forEach((event) => {
        test(`${event.constructor.name}: Message is logged`, () => {
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.message);
        });
    });
    test(`OmnisharpServerEnqueueRequest: Name and Command is logged`, () => {
        let event = new loggingEvents_1.OmnisharpServerEnqueueRequest("foo", "someCommand");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.queueName);
        chai_1.expect(logOutput).to.contain(event.command);
    });
    test(`OmnisharpServerDequeueRequest: QueueName, QueueStatus, Command and Id is logged`, () => {
        let event = new loggingEvents_1.OmnisharpServerDequeueRequest("foo", "pending", "someCommand", 1);
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.queueName);
        chai_1.expect(logOutput).to.contain(event.queueStatus);
        chai_1.expect(logOutput).to.contain(event.command);
        chai_1.expect(logOutput).to.contain(event.id);
    });
    test(`OmnisharpProcessRequestStart: Name and slots is logged`, () => {
        let event = new loggingEvents_1.OmnisharpServerProcessRequestStart("foobar", 2);
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.name);
        chai_1.expect(logOutput).to.contain(event.availableRequestSlots);
    });
    test(`OmnisharpServerRequestCancelled: Name and Id is logged`, () => {
        let event = new loggingEvents_1.OmnisharpServerRequestCancelled("foobar", 23);
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.command);
        chai_1.expect(logOutput).to.contain(event.id);
    });
    test(`OmnisharpServer messages increase and decrease indent`, () => {
        observer.post(new loggingEvents_1.OmnisharpServerVerboseMessage("!indented_1"));
        observer.post(new loggingEvents_1.OmnisharpServerProcessRequestStart("name", 2));
        observer.post(new loggingEvents_1.OmnisharpServerVerboseMessage("indented"));
        observer.post(new loggingEvents_1.OmnisharpServerProcessRequestComplete());
        observer.post(new loggingEvents_1.OmnisharpServerVerboseMessage("!indented_2"));
        chai_1.expect(logOutput).to.startWith("    !indented_1");
        chai_1.expect(logOutput).to.contain("\n        indented");
        chai_1.expect(logOutput).to.contain("\n    !indented_2");
    });
    suite('OmnisharpEventPacketReceived', () => {
        test(`Information messages with name OmniSharp.Middleware.LoggingMiddleware and follow pattern /^\/[\/\w]+: 200 \d+ms/ are logged`, () => {
            let event = new loggingEvents_1.OmnisharpEventPacketReceived("INFORMATION", "OmniSharp.Middleware.LoggingMiddleware", "/codecheck: 200 339ms");
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.message);
            chai_1.expect(logOutput).to.contain(event.name);
        });
        [
            new loggingEvents_1.OmnisharpEventPacketReceived("TRACE", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("DEBUG", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("INFORMATION", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("WARNING", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("ERROR", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("CRITICAL", "foo", "someMessage"),
        ].forEach((event) => {
            test(`${event.logLevel} messages are not logged`, () => {
                observer.post(event);
                chai_1.expect(logOutput).to.be.empty;
            });
        });
    });
    suite('OmnisharpRequestMessage', () => {
        test(`Request Command and Id is logged`, () => {
            let event = new loggingEvents_1.OmnisharpRequestMessage({ command: "someCommand", onSuccess: () => { }, onError: () => { } }, 1);
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.id);
            chai_1.expect(logOutput).to.contain(event.request.command);
        });
        test(`Request Data is logged when it is not empty`, () => {
            let event = new loggingEvents_1.OmnisharpRequestMessage({ command: "someCommand", onSuccess: () => { }, onError: () => { }, data: "someData" }, 1);
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.request.data);
        });
    });
});
//# sourceMappingURL=OmnisharpDebugModeLoggerObserver.test.js.map