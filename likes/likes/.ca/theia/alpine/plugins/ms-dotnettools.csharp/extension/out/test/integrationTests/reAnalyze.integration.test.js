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
const vscode = require("vscode");
const path = require("path");
const chai_1 = require("chai");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const poll_1 = require("./poll");
const EventType_1 = require("../../src/omnisharp/EventType");
const protocol_1 = require("../../src/omnisharp/protocol");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
function listenEvents(stream, type) {
    let results = [];
    stream.subscribe((event) => {
        if (event.type === type) {
            results.push(event);
        }
    });
    return results;
}
suite(`ReAnalyze: ${testAssetWorkspace_1.default.description}`, function () {
    let interfaceUri;
    let interfaceImplUri;
    let eventStream;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            eventStream = (yield integrationHelpers_1.activateCSharpExtension()).eventStream;
            yield testAssetWorkspace_1.default.restore();
            let projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            interfaceUri = vscode.Uri.file(path.join(projectDirectory, 'ISomeInterface.cs'));
            interfaceImplUri = vscode.Uri.file(path.join(projectDirectory, 'SomeInterfaceImpl.cs'));
            yield vscode.commands.executeCommand("vscode.open", interfaceImplUri);
            yield vscode.commands.executeCommand("vscode.open", interfaceUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test("When interface is manually renamed, then return correct analysis after re-analysis of project", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let diagnosticStatusEvents = listenEvents(eventStream, EventType_1.EventType.ProjectDiagnosticStatus);
            yield vscode.commands.executeCommand("vscode.open", interfaceUri);
            let editor = vscode.window.activeTextEditor;
            yield editor.edit(editorBuilder => editorBuilder.replace(new vscode.Range(2, 0, 2, 50), 'public interface ISomeInterfaceRenamedNow'));
            yield vscode.commands.executeCommand('o.reanalyze.currentProject', interfaceImplUri);
            yield poll_1.poll(() => diagnosticStatusEvents, 15 * 1000, 500, r => r.find(x => x.message.Status === protocol_1.DiagnosticStatus.Ready) !== undefined);
            yield poll_1.assertWithPoll(() => vscode.languages.getDiagnostics(interfaceImplUri), 15 * 1000, 500, res => chai_1.expect(res.find(x => x.message.includes("CS0246"))));
        });
    });
    test("When re-analyze of project is executed then eventually get notified about them.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let diagnosticStatusEvents = listenEvents(eventStream, EventType_1.EventType.ProjectDiagnosticStatus);
            yield vscode.commands.executeCommand('o.reanalyze.currentProject', interfaceImplUri);
            yield poll_1.poll(() => diagnosticStatusEvents, 15 * 1000, 500, r => r.find(x => x.message.Status === protocol_1.DiagnosticStatus.Processing) != undefined);
            yield poll_1.poll(() => diagnosticStatusEvents, 15 * 1000, 500, r => r.find(x => x.message.Status === protocol_1.DiagnosticStatus.Ready) != undefined);
        });
    });
    test("When re-analyze of all projects is executed then eventually get notified about them.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let diagnosticStatusEvents = listenEvents(eventStream, EventType_1.EventType.ProjectDiagnosticStatus);
            yield vscode.commands.executeCommand('o.reanalyze.allProjects', interfaceImplUri);
            yield poll_1.poll(() => diagnosticStatusEvents, 15 * 1000, 500, r => r.find(x => x.message.Status === protocol_1.DiagnosticStatus.Processing) != undefined);
            yield poll_1.poll(() => diagnosticStatusEvents, 15 * 1000, 500, r => r.find(x => x.message.Status === protocol_1.DiagnosticStatus.Ready) != undefined);
        });
    });
});
//# sourceMappingURL=reAnalyze.integration.test.js.map