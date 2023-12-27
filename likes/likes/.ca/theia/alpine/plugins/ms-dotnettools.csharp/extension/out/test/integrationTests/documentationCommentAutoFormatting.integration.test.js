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
const vscode = require("vscode");
const path = require("path");
const integrationHelpers_1 = require("./integrationHelpers");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const onTypeFormatProviderCommand = 'vscode.executeFormatOnTypeProvider';
function normalizeNewlines(original) {
    while (original.indexOf('\r\n') != -1) {
        original = original.replace('\r\n', '\n');
    }
    return original;
}
suite(`Documentation Comment Auto Formatting: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            if (integrationHelpers_1.isRazorWorkspace(vscode.workspace)) {
                // The format-on-type provider does not run for razor files.
                this.skip();
            }
            const projectDirectory = testAssetWorkspace_1.default.projects[0].projectDirectoryPath;
            const filePath = path.join(projectDirectory, 'DocComments.cs');
            fileUri = vscode.Uri.file(filePath);
            yield vscode.commands.executeCommand('vscode.open', fileUri);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
    test('Triple slash inserts doc comment snippet', () => __awaiter(this, void 0, void 0, function* () {
        const commentPosition = new vscode.Position(2, 7);
        const formatEdits = (yield vscode.commands.executeCommand(onTypeFormatProviderCommand, fileUri, commentPosition, '/'));
        chai_1.expect(formatEdits).ofSize(1);
        chai_1.expect(normalizeNewlines(formatEdits[0].newText)).eq(" <summary>\n    /// \n    /// </summary>\n    /// <param name=\"param1\"></param>\n    /// <param name=\"param2\"></param>\n    /// <returns></returns>");
        chai_1.expect(formatEdits[0].range.start.line).eq(commentPosition.line);
        chai_1.expect(formatEdits[0].range.start.character).eq(commentPosition.character);
        chai_1.expect(formatEdits[0].range.end.line).eq(commentPosition.line);
        chai_1.expect(formatEdits[0].range.end.character).eq(commentPosition.character);
    }));
    test('Enter in comment inserts triple-slashes preceding', () => __awaiter(this, void 0, void 0, function* () {
        const commentPosition = new vscode.Position(9, 0);
        const formatEdits = (yield vscode.commands.executeCommand(onTypeFormatProviderCommand, fileUri, commentPosition, '\n'));
        chai_1.expect(formatEdits).ofSize(1);
        chai_1.expect(formatEdits[0].newText).eq("    /// ");
        chai_1.expect(formatEdits[0].range.start.line).eq(commentPosition.line);
        chai_1.expect(formatEdits[0].range.start.character).eq(commentPosition.character);
        chai_1.expect(formatEdits[0].range.end.line).eq(commentPosition.line);
        chai_1.expect(formatEdits[0].range.end.character).eq(commentPosition.character);
    }));
});
//# sourceMappingURL=documentationCommentAutoFormatting.integration.test.js.map