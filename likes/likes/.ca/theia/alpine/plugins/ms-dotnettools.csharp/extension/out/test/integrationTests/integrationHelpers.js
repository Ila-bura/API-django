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
exports.isRazorWorkspace = exports.restartOmniSharpServer = exports.activateCSharpExtension = void 0;
const path = require("path");
const vscode = require("vscode");
const EventType_1 = require("../../src/omnisharp/EventType");
function activateCSharpExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        const csharpExtension = vscode.extensions.getExtension("muhammad-sammy.csharp");
        if (!csharpExtension.isActive) {
            yield csharpExtension.activate();
        }
        try {
            yield csharpExtension.exports.initializationFinished();
            console.log("muhammad-sammy.csharp activated");
            return {
                advisor: yield csharpExtension.exports.getAdvisor(),
                eventStream: csharpExtension.exports.eventStream
            };
        }
        catch (err) {
            console.log(JSON.stringify(err));
            return undefined;
        }
    });
}
exports.activateCSharpExtension = activateCSharpExtension;
function restartOmniSharpServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const csharpExtension = vscode.extensions.getExtension("muhammad-sammy.csharp");
        if (!csharpExtension.isActive) {
            yield activateCSharpExtension();
        }
        try {
            yield new Promise(resolve => {
                const hook = csharpExtension.exports.eventStream.subscribe(event => {
                    if (event.type == EventType_1.EventType.OmnisharpStart) {
                        hook.unsubscribe();
                        resolve();
                    }
                });
                vscode.commands.executeCommand("o.restart");
            });
            console.log("OmniSharp restarted");
        }
        catch (err) {
            console.log(JSON.stringify(err));
            return;
        }
    });
}
exports.restartOmniSharpServer = restartOmniSharpServer;
function isRazorWorkspace(workspace) {
    const primeWorkspace = workspace.workspaceFolders[0];
    const projectFileName = primeWorkspace.uri.fsPath.split(path.sep).pop();
    return projectFileName === 'BasicRazorApp2_1';
}
exports.isRazorWorkspace = isRazorWorkspace;
//# sourceMappingURL=integrationHelpers.js.map