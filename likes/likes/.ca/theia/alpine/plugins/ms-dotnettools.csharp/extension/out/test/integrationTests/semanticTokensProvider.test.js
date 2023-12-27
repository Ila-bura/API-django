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
const EventType_1 = require("../../src/omnisharp/EventType");
const poll_1 = require("./poll");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
function assertTokens(fileUri, expected, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const legend = yield vscode.commands.executeCommand("vscode.provideDocumentSemanticTokensLegend", fileUri);
        const actual = yield vscode.commands.executeCommand("vscode.provideDocumentSemanticTokens", fileUri);
        if (!actual) {
            chai_1.assert.isNull(expected, message);
            return;
        }
        let actualRanges = [];
        let lastLine = 0;
        let lastCharacter = 0;
        for (let i = 0; i < actual.data.length; i += 5) {
            const lineDelta = actual.data[i], charDelta = actual.data[i + 1], len = actual.data[i + 2], typeIdx = actual.data[i + 3], modSet = actual.data[i + 4];
            const line = lastLine + lineDelta;
            const character = lineDelta === 0 ? lastCharacter + charDelta : charDelta;
            const tokenClassifiction = [legend.tokenTypes[typeIdx], ...legend.tokenModifiers.filter((_, i) => modSet & 1 << i)].join('.');
            actualRanges.push(t(line, character, len, tokenClassifiction));
            lastLine = line;
            lastCharacter = character;
        }
        chai_1.assert.deepEqual(actualRanges, expected, message);
    });
}
suite(`SemanticTokensProvider: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            // These tests don't run on the BasicRazorApp2_1 solution
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                this.skip();
            }
            const activation = yield integrationHelpers_1.activateCSharpExtension();
            yield testAssetWorkspace_1.default.restore();
            // Wait for workspace information to be returned
            let isWorkspaceLoaded = false;
            const subscription = activation.eventStream.subscribe(event => {
                if (event.type === EventType_1.EventType.WorkspaceInformationUpdated) {
                    isWorkspaceLoaded = true;
                    subscription.unsubscribe();
                }
            });
            yield poll_1.poll(() => isWorkspaceLoaded, 25000, 500);
            const fileName = 'semantictokens.cs';
            const projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            fileUri = vscode.Uri.file(path.join(projectDirectory, fileName));
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    test('Semantic Highlighting returns null when disabled', () => __awaiter(this, void 0, void 0, function* () {
        let csharpConfig = vscode.workspace.getConfiguration('csharp');
        yield csharpConfig.update('semanticHighlighting.enabled', false, vscode.ConfigurationTarget.Global);
        yield assertTokens(fileUri, /*expected*/ null);
    }));
    test('Semantic Highlighting returns classified tokens when enabled', () => __awaiter(this, void 0, void 0, function* () {
        let csharpConfig = vscode.workspace.getConfiguration('csharp');
        yield csharpConfig.update('semanticHighlighting.enabled', true, vscode.ConfigurationTarget.Global);
        yield assertTokens(fileUri, [
            // 0:namespace Test
            _keyword("namespace", 0, 0), _namespace("Test", 0, 10),
            // 1:{
            _punctuation("{", 1, 0),
            // 2:    public class TestProgram
            _keyword("public", 2, 4), _keyword("class", 2, 11), _class("TestProgram", 2, 17),
            // 3:    {
            _punctuation("{", 3, 4),
            // 4:        public static int TestMain(string[] args)
            _keyword("public", 4, 8), _keyword("static", 4, 15), _keyword("int", 4, 22), _staticMethod("TestMain", 4, 26), _punctuation("(", 4, 34), _keyword("string", 4, 35), _punctuation("[", 4, 41), _punctuation("]", 4, 42), _parameter("args", 4, 44), _punctuation(")", 4, 48),
            // 5:        {
            _punctuation("{", 5, 8),
            // 6:            System.Console.WriteLine(string.Join(',', args));
            _namespace("System", 6, 12), _operator(".", 6, 18), _staticClass("Console", 6, 19), _operator(".", 6, 26), _staticMethod("WriteLine", 6, 27), _punctuation("(", 6, 36), _keyword("string", 6, 37), _operator(".", 6, 43), _staticMethod("Join", 6, 44), _punctuation("(", 6, 48), _string("','", 6, 49), _punctuation(")", 6, 52), _parameter("args", 6, 54), _punctuation(")", 6, 58), _punctuation(")", 6, 59), _punctuation(";", 6, 60),
            // 7:            return 0;
            _controlKeyword("return", 7, 12), _number("0", 7, 19), _punctuation(";", 7, 20),
            // 8:        }
            _punctuation("}", 8, 8),
            // 9:    }
            _punctuation("}", 9, 4),
            //10: }
            _punctuation("}", 10, 0),
        ]);
    }));
});
function t(startLine, character, length, tokenClassifiction) {
    return { startLine, character, length, tokenClassifiction };
}
const _keyword = (text, line, col) => t(line, col, text.length, "plainKeyword");
const _controlKeyword = (text, line, col) => t(line, col, text.length, "controlKeyword");
const _punctuation = (text, line, col) => t(line, col, text.length, "punctuation");
const _operator = (text, line, col) => t(line, col, text.length, "operator");
const _number = (text, line, col) => t(line, col, text.length, "number");
const _string = (text, line, col) => t(line, col, text.length, "string");
const _namespace = (text, line, col) => t(line, col, text.length, "namespace");
const _class = (text, line, col) => t(line, col, text.length, "class");
const _staticClass = (text, line, col) => t(line, col, text.length, "class.static");
const _staticMethod = (text, line, col) => t(line, col, text.length, "member.static");
const _parameter = (text, line, col) => t(line, col, text.length, "parameter");
//# sourceMappingURL=semanticTokensProvider.test.js.map