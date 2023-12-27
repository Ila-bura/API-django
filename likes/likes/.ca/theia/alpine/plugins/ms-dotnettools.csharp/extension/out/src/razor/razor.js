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
exports.activateRazorExtension = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const Razor = require("microsoft.aspnetcore.razor.vscode");
function activateRazorExtension(context, extensionPath, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        const razorConfig = vscode.workspace.getConfiguration('razor');
        const configuredLanguageServerDir = razorConfig.get('languageServer.directory', null);
        const languageServerDir = configuredLanguageServerDir || path.join(extensionPath, '.razor');
        if (fs.existsSync(languageServerDir)) {
            yield Razor.activate(vscode, context, languageServerDir, eventStream, /* enableProposedApis: */ false);
        }
        else if (configuredLanguageServerDir) {
            // It's only an error if the nonexistent dir was explicitly configured
            // If it's the default dir, this is expected for unsupported platforms
            vscode.window.showErrorMessage(`Cannot load Razor language server because the configured directory was not found: '${languageServerDir}'`);
        }
    });
}
exports.activateRazorExtension = activateRazorExtension;
//# sourceMappingURL=razor.js.map