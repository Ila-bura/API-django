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
exports.getDecompilationAuthorization = void 0;
const vscode = require("vscode");
function getDecompilationAuthorization(context, optionProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // If decompilation is disabled the return false
        const options = optionProvider.GetLatestOptions();
        if (options.enableDecompilationSupport === false) {
            return false;
        }
        // If the terms have been acknowledged for this workspace then return.
        let decompilationAutorized = context.workspaceState.get("decompilationAuthorized");
        if (decompilationAutorized !== undefined) {
            return decompilationAutorized;
        }
        const result = yield promptToAcceptDecompilationTerms();
        decompilationAutorized = result === PromptResult.Yes;
        yield context.workspaceState.update("decompilationAuthorized", decompilationAutorized);
        return decompilationAutorized;
    });
}
exports.getDecompilationAuthorization = getDecompilationAuthorization;
var PromptResult;
(function (PromptResult) {
    PromptResult[PromptResult["Dismissed"] = 0] = "Dismissed";
    PromptResult[PromptResult["Yes"] = 1] = "Yes";
    PromptResult[PromptResult["No"] = 2] = "No";
})(PromptResult || (PromptResult = {}));
function promptToAcceptDecompilationTerms() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const message = `IMPORTANT: C# extension includes decompiling functionality (“Decompiler”) that enables reproducing source code from binary code. By accessing and using the Decompiler, you agree to the terms for the Decompiler below. If you do not agree with these terms, do not access or use the Decompiler.

You acknowledge that binary code and source code might be protected by copyright and trademark laws.  Before using the Decompiler on any binary code, you need to first:

(i) confirm that the license terms governing your use of the binary code do not contain a provision which prohibits you from decompiling the software; or

(ii) obtain permission to decompile the binary code from the owner of the software.

Your use of the Decompiler is optional.  Microsoft is not responsible and disclaims all liability for your use of the Decompiler that violates any laws or any software license terms which prohibit decompiling of the software.

I agree to all of the foregoing:`;
            const messageOptions = { modal: true };
            const yesItem = { title: 'Yes', result: PromptResult.Yes };
            const noItem = { title: 'No', result: PromptResult.No, isCloseAffordance: true };
            vscode.window.showWarningMessage(message, messageOptions, noItem, yesItem)
                .then(selection => { var _a; return resolve((_a = selection === null || selection === void 0 ? void 0 : selection.result) !== null && _a !== void 0 ? _a : PromptResult.Dismissed); });
        });
    });
}
//# sourceMappingURL=decompilationPrompt.js.map