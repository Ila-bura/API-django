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
const Fakes_1 = require("../testAssets/Fakes");
const reportIssue_1 = require("../../../src/features/reportIssue");
const EventStream_1 = require("../../../src/EventStream");
const TestEventBus_1 = require("../testAssets/TestEventBus");
const chai_1 = require("chai");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const FakeGetDotnetInfo_1 = require("../Fakes/FakeGetDotnetInfo");
const FakeMonoResolver_1 = require("../Fakes/FakeMonoResolver");
suite(`${reportIssue_1.default.name}`, () => {
    const vscodeVersion = "myVersion";
    const csharpExtVersion = "csharpExtVersion";
    const isValidForMono = true;
    let vscode;
    const extension1 = {
        packageJSON: {
            name: "name1",
            publisher: "publisher1",
            version: "version1",
            isBuiltin: true
        },
        id: "id1"
    };
    const extension2 = {
        packageJSON: {
            name: "name2",
            publisher: "publisher2",
            version: "version2",
            isBuiltin: false
        },
        id: "id2"
    };
    let fakeMonoResolver;
    let eventStream;
    let eventBus;
    let getDotnetInfo = FakeGetDotnetInfo_1.FakeGetDotnetInfo;
    let options;
    let issueBody;
    setup(() => {
        vscode = Fakes_1.getFakeVsCode();
        vscode.extensions.getExtension = () => {
            return {
                packageJSON: {
                    version: csharpExtVersion
                },
                id: ""
            };
        };
        vscode.env.clipboard.writeText = (body) => {
            issueBody = body;
            return undefined;
        };
        vscode.version = vscodeVersion;
        vscode.extensions.all = [extension1, extension2];
        eventStream = new EventStream_1.EventStream();
        eventBus = new TestEventBus_1.default(eventStream);
        fakeMonoResolver = new FakeMonoResolver_1.FakeMonoResolver();
    });
    test(`${loggingEvents_1.OpenURL.name} event is created`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
        let events = eventBus.getEvents();
        chai_1.expect(events).to.have.length(1);
        chai_1.expect(events[0].constructor.name).to.be.equal(`${loggingEvents_1.OpenURL.name}`);
    }));
    test(`${loggingEvents_1.OpenURL.name} event is created with the omnisharp-vscode github repo issues url`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, false, options, fakeMonoResolver);
        let url = eventBus.getEvents()[0].url;
        chai_1.expect(url).to.include("https://github.com/OmniSharp/omnisharp-vscode/issues/new?body=Please paste the output from your clipboard");
    }));
    suite("The body is passed to the vscode clipboard and", () => {
        test("it contains the vscode version", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(issueBody).to.include(`**VSCode version**: ${vscodeVersion}`);
        }));
        test("it contains the csharp extension version", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(issueBody).to.include(`**C# Extension**: ${csharpExtVersion}`);
        }));
        test("it contains dotnet info", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(issueBody).to.contain(FakeGetDotnetInfo_1.fakeDotnetInfo.FullInfo);
        }));
        test("mono information is obtained when it is a valid mono platform", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(fakeMonoResolver.getGlobalMonoCalled).to.be.equal(true);
        }));
        test("mono version is put in the body when shouldUseGlobalMono returns a monoInfo", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(fakeMonoResolver.getGlobalMonoCalled).to.be.equal(true);
            chai_1.expect(issueBody).to.contain(FakeMonoResolver_1.fakeMonoInfo.version);
        }));
        test("built-in mono usage message is put in the body when shouldUseGlobalMono returns a null", () => __awaiter(void 0, void 0, void 0, function* () {
            fakeMonoResolver = new FakeMonoResolver_1.FakeMonoResolver(false);
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(fakeMonoResolver.getGlobalMonoCalled).to.be.equal(true);
            chai_1.expect(issueBody).to.contain(`OmniSharp using built-in mono`);
        }));
        test("mono information is not obtained when it is not a valid mono platform", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, false, options, fakeMonoResolver);
            chai_1.expect(fakeMonoResolver.getGlobalMonoCalled).to.be.equal(false);
        }));
        test("The url contains the name, publisher and version for all the extensions that are not builtin", () => __awaiter(void 0, void 0, void 0, function* () {
            yield reportIssue_1.default(vscode, eventStream, getDotnetInfo, isValidForMono, options, fakeMonoResolver);
            chai_1.expect(issueBody).to.contain(extension2.packageJSON.name);
            chai_1.expect(issueBody).to.contain(extension2.packageJSON.publisher);
            chai_1.expect(issueBody).to.contain(extension2.packageJSON.version);
            chai_1.expect(issueBody).to.not.contain(extension1.packageJSON.name);
            chai_1.expect(issueBody).to.not.contain(extension1.packageJSON.publisher);
            chai_1.expect(issueBody).to.not.contain(extension1.packageJSON.version);
        }));
    });
});
//# sourceMappingURL=reportIssue.test.js.map