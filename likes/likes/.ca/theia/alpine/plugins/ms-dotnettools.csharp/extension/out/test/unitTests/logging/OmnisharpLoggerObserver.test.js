"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const OmnisharpLoggerObserver_1 = require("../../../src/observers/OmnisharpLoggerObserver");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
suite("OmnisharpLoggerObserver", () => {
    suiteSetup(() => chai_1.should());
    let logOutput = "";
    let observer = new OmnisharpLoggerObserver_1.OmnisharpLoggerObserver(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { logOutput += text; } }));
    setup(() => {
        logOutput = "";
    });
    suite('OmnisharpServerMsBuildProjectDiagnostics', () => {
        test("Logged message is empty if there are no warnings and erros", () => {
            let event = new loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics({
                FileName: "someFile",
                Warnings: [],
                Errors: []
            });
            observer.post(event);
            chai_1.expect(logOutput).to.be.empty;
        });
        test(`Logged message contains the Filename if there is atleast one error or warning`, () => {
            let event = new loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics({
                FileName: "someFile",
                Warnings: [{ FileName: "warningFile", LogLevel: "", Text: "", StartLine: 0, EndLine: 0, StartColumn: 0, EndColumn: 0 }],
                Errors: []
            });
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.diagnostics.FileName);
        });
        [
            new loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics({
                FileName: "someFile",
                Warnings: [{ FileName: "warningFile", LogLevel: "", Text: "someWarningText", StartLine: 1, EndLine: 2, StartColumn: 3, EndColumn: 4 }],
                Errors: [{ FileName: "errorFile", LogLevel: "", Text: "someErrorText", StartLine: 5, EndLine: 6, StartColumn: 7, EndColumn: 8 }]
            })
        ].forEach((event) => {
            test(`Logged message contains the Filename, StartColumn, StartLine and Text for the diagnostic warnings`, () => {
                observer.post(event);
                event.diagnostics.Warnings.forEach(element => {
                    chai_1.expect(logOutput).to.contain(element.FileName);
                    chai_1.expect(logOutput).to.contain(element.StartLine);
                    chai_1.expect(logOutput).to.contain(element.StartColumn);
                    chai_1.expect(logOutput).to.contain(element.Text);
                });
            });
            test(`Logged message contains the Filename, StartColumn, StartLine and Text for the diagnostics errors`, () => {
                observer.post(event);
                event.diagnostics.Errors.forEach(element => {
                    chai_1.expect(logOutput).to.contain(element.FileName);
                    chai_1.expect(logOutput).to.contain(element.StartLine);
                    chai_1.expect(logOutput).to.contain(element.StartColumn);
                    chai_1.expect(logOutput).to.contain(element.Text);
                });
            });
        });
    });
    [
        new loggingEvents_1.OmnisharpServerOnStdErr("on std error message"),
        new loggingEvents_1.OmnisharpServerMessage("server message"),
    ].forEach((event) => {
        test(`${event.constructor.name}: Message is logged`, () => {
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.message);
        });
    });
    test(`OmnisharpServerOnServerError: Message is logged`, () => {
        let event = new loggingEvents_1.OmnisharpServerOnServerError("on server error message");
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.err);
    });
    [
        new loggingEvents_1.OmnisharpInitialisation(new Date(5), "somePath"),
    ].forEach((event) => {
        test(`${event.constructor.name}: TimeStamp and SolutionPath are logged`, () => {
            observer.post(event);
            chai_1.expect(logOutput).to.contain(event.timeStamp.toLocaleString());
            chai_1.expect(logOutput).to.contain(event.solutionPath);
        });
    });
    test('OmnisharpFailure: Failure message is logged', () => {
        let event = new loggingEvents_1.OmnisharpFailure("failureMessage", new Error("errorMessage"));
        observer.post(event);
        chai_1.expect(logOutput).to.contain(event.message);
    });
    suite('OmnisharpEventPacketReceived', () => {
        [
            new loggingEvents_1.OmnisharpEventPacketReceived("TRACE", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("DEBUG", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("INFORMATION", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("WARNING", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("ERROR", "foo", "someMessage"),
            new loggingEvents_1.OmnisharpEventPacketReceived("CRITICAL", "foo", "someMessage"),
        ].forEach((event) => {
            test(`${event.logLevel} messages are logged with name and the message`, () => {
                observer.post(event);
                chai_1.expect(logOutput).to.contain(event.name);
                chai_1.expect(logOutput).to.contain(event.message);
            });
        });
        test('Throws error on unknown log level', () => {
            let event = new loggingEvents_1.OmnisharpEventPacketReceived("random log level", "foo", "someMessage");
            let fn = function () { observer.post(event); };
            chai_1.expect(fn).to.throw(Error);
        });
        test(`Information messages with name OmniSharp.Middleware.LoggingMiddleware and follow pattern /^\/[\/\w]+: 200 \d+ms/ are not logged`, () => {
            let event = new loggingEvents_1.OmnisharpEventPacketReceived("INFORMATION", "OmniSharp.Middleware.LoggingMiddleware", "/codecheck: 200 339ms");
            observer.post(event);
            chai_1.expect(logOutput).to.be.empty;
        });
    });
    suite('OmnisharpLaunch', () => {
        [
            { 'event': new loggingEvents_1.OmnisharpLaunch("5.8.0", undefined, "someCommand", 4), 'expected': "OmniSharp server started with Mono 5.8.0." },
            { 'event': new loggingEvents_1.OmnisharpLaunch(undefined, undefined, "someCommand", 4), 'expected': "OmniSharp server started." },
            { 'event': new loggingEvents_1.OmnisharpLaunch("5.8.0", "path to mono", "someCommand", 4), 'expected': "OmniSharp server started with Mono 5.8.0 (path to mono)." },
            { 'event': new loggingEvents_1.OmnisharpLaunch(undefined, "path to mono", "someCommand", 4), 'expected': "OmniSharp server started." },
        ].forEach((data) => {
            const event = data.event;
            test(`Command and Pid are displayed`, () => {
                observer.post(event);
                chai_1.expect(logOutput).to.contain(event.command);
                chai_1.expect(logOutput).to.contain(event.pid);
            });
            test(`Message is displayed depending on monoVersion and monoPath value`, () => {
                observer.post(event);
                chai_1.expect(logOutput).to.contain(data.expected);
            });
        });
    });
    suite('OmnisharpServerOnError', () => {
        test(`Doesnot throw error if FileName is null`, () => {
            let event = new loggingEvents_1.OmnisharpServerOnError({ Text: "someText", FileName: null, Line: 1, Column: 2 });
            let fn = function () { observer.post(event); };
            chai_1.expect(fn).to.not.throw(Error);
        });
        [
            new loggingEvents_1.OmnisharpServerOnError({ Text: "someText", FileName: "someFile", Line: 1, Column: 2 }),
        ].forEach((event) => {
            test(`Contains the error message text`, () => {
                observer.post(event);
                chai_1.expect(logOutput).to.contain(event.errorMessage.Text);
            });
            test(`Contains the error message FileName, Line and column if FileName is not null`, () => {
                observer.post(event);
                if (event.errorMessage.FileName) {
                    chai_1.expect(logOutput).to.contain(event.errorMessage.FileName);
                    chai_1.expect(logOutput).to.contain(event.errorMessage.Line);
                    chai_1.expect(logOutput).to.contain(event.errorMessage.Column);
                }
            });
        });
    });
});
//# sourceMappingURL=OmnisharpLoggerObserver.test.js.map