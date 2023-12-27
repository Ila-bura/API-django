"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const DotnetTestLoggerObserver_1 = require("../../../src/observers/DotnetTestLoggerObserver");
const expect = chai.expect;
chai.use(require('chai-string'));
suite(`${DotnetTestLoggerObserver_1.default.name}`, () => {
    let appendedMessage;
    let observer = new DotnetTestLoggerObserver_1.default(Object.assign(Object.assign({}, Fakes_1.getNullChannel()), { append: (text) => { appendedMessage += text; } }));
    setup(() => {
        appendedMessage = "";
    });
    [
        new loggingEvents_1.DotNetTestDebugWarning("some warning"),
        new loggingEvents_1.DotNetTestMessage("some message")
    ].forEach((event) => {
        test(`${event.constructor.name}: Message is logged`, () => {
            observer.post(event);
            expect(appendedMessage).to.contain(event.message);
        });
    });
    [
        new loggingEvents_1.DotNetTestDebugStart("foo"),
        new loggingEvents_1.DotNetTestRunStart("foo")
    ].forEach((event) => {
        test(`${event.constructor.name}: Test method is logged`, () => {
            expect(appendedMessage).to.be.empty;
            observer.post(event);
            expect(appendedMessage).to.contain("foo");
        });
    });
    [
        new loggingEvents_1.DotNetTestsInClassDebugStart("foo"),
        new loggingEvents_1.DotNetTestsInClassRunStart("foo")
    ].forEach((event) => {
        test(`${event.constructor.name}: Class name is logged`, () => {
            expect(appendedMessage).to.be.empty;
            observer.post(event);
            expect(appendedMessage).to.contain("foo");
        });
    });
    [
        new loggingEvents_1.DotNetTestRunInContextStart("foo", 1, 2),
        new loggingEvents_1.DotNetTestDebugInContextStart("foo", 1, 2)
    ].forEach((event) => {
        test(`${event.constructor.name}: File name and line/column are logged`, () => {
            expect(appendedMessage).to.be.empty;
            observer.post(event);
            expect(appendedMessage).to.contain("foo").and.contain("2").and.contain("3");
        });
    });
    test(`${loggingEvents_1.DotNetTestDebugProcessStart.name}: Target process id is logged`, () => {
        let event = new loggingEvents_1.DotNetTestDebugProcessStart(111);
        observer.post(event);
        expect(appendedMessage).to.contain(event.targetProcessId);
    });
    test(`${loggingEvents_1.DotNetTestDebugComplete.name}: Message is logged`, () => {
        let event = new loggingEvents_1.DotNetTestDebugComplete();
        observer.post(event);
        expect(appendedMessage).to.not.be.empty;
    });
    suite(`${loggingEvents_1.ReportDotNetTestResults.name}`, () => {
        let event = new loggingEvents_1.ReportDotNetTestResults([
            getDotNetTestResults("foo", "failed", "assertion failed", "stacktrace1", ["message1", "message2"], ["errorMessage1"]),
            getDotNetTestResults("failinator", "failed", "error occurred", "stacktrace2", [], []),
            getDotNetTestResults("bar", "skipped", "", "", ["message3", "message4"], []),
            getDotNetTestResults("passinator", "passed", "", "", [], []),
        ]);
        test(`Displays the outcome of each test`, () => {
            observer.post(event);
            event.results.forEach(result => {
                expect(appendedMessage).to.containIgnoreCase(`${result.MethodName}:\n    Outcome: ${result.Outcome}`);
            });
        });
        test(`Displays the total outcome`, () => {
            observer.post(event);
            expect(appendedMessage).to.contain(`Total tests: 4. Passed: 1. Failed: 2. Skipped: 1`);
        });
        test('Displays the error message and error stack trace if any is present', () => {
            observer.post(event);
            expect(appendedMessage).to.contain("foo:\n    Outcome: Failed\n    Error Message:\n    assertion failed\n    Stack Trace:\n    stacktrace1");
            expect(appendedMessage).to.contain("failinator:\n    Outcome: Failed\n    Error Message:\n    error occurred\n    Stack Trace:\n    stacktrace2");
        });
        test(`Displays the standard output messages if any`, () => {
            observer.post(event);
            event.results.forEach(result => {
                result.StandardOutput.forEach(message => expect(appendedMessage).to.contain(message));
            });
        });
        test(`Displays the standard error messages if any`, () => {
            observer.post(event);
            event.results.forEach(result => {
                result.StandardError.forEach(message => expect(appendedMessage).to.contain(message));
            });
        });
        test(`Can handle malformed results`, () => {
            observer.post(new loggingEvents_1.ReportDotNetTestResults([]));
            expect(appendedMessage).to.contain("----- Test Execution Summary -----\n\nTotal tests: 0. Passed: 0. Failed: 0. Skipped: 0");
        });
    });
});
function getDotNetTestResults(methodname, outcome, errorMessage, errorStackTrace, stdoutMessages, stdErrorMessages) {
    return {
        MethodName: methodname,
        Outcome: outcome,
        ErrorMessage: errorMessage,
        ErrorStackTrace: errorStackTrace,
        StandardOutput: stdoutMessages,
        StandardError: stdErrorMessages
    };
}
//# sourceMappingURL=DotnetTestLoggerObserver.test.js.map