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
const vscode_1 = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
const CompositeDisposable_1 = require("../CompositeDisposable");
function forwardDocumentChanges(server) {
    return vscode_1.workspace.onDidChangeTextDocument(event => {
        let { document, contentChanges } = event;
        if (document.isUntitled || document.languageId !== 'csharp' || document.uri.scheme !== 'file' || contentChanges.length === 0) {
            return;
        }
        if (!server.isRunning()) {
            return;
        }
        serverUtils.updateBuffer(server, { Buffer: document.getText(), FileName: document.fileName }).catch(err => {
            console.error(err);
            return err;
        });
    });
}
function forwardFileChanges(server) {
    function onFileSystemEvent(changeType) {
        return function (uri) {
            if (!server.isRunning()) {
                return;
            }
            let req = { FileName: uri.fsPath, changeType };
            serverUtils.filesChanged(server, [req]).catch(err => {
                console.warn(`[o] failed to forward file change event for ${uri.fsPath}`, err);
                return err;
            });
        };
    }
    function onFolderEvent(changeType) {
        return function (uri) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!server.isRunning()) {
                    return;
                }
                if (changeType === protocol_1.FileChangeType.Delete) {
                    let requests = [{ FileName: uri.fsPath, changeType: protocol_1.FileChangeType.DirectoryDelete }];
                    serverUtils.filesChanged(server, requests).catch(err => {
                        console.warn(`[o] failed to forward file change event for ${uri.fsPath}`, err);
                        return err;
                    });
                }
            });
        };
    }
    const watcher = vscode_1.workspace.createFileSystemWatcher('**/*.*');
    let d1 = watcher.onDidCreate(onFileSystemEvent(protocol_1.FileChangeType.Create));
    let d2 = watcher.onDidDelete(onFileSystemEvent(protocol_1.FileChangeType.Delete));
    let d3 = watcher.onDidChange(onFileSystemEvent(protocol_1.FileChangeType.Change));
    const watcherForFolders = vscode_1.workspace.createFileSystemWatcher('**/');
    let d4 = watcherForFolders.onDidDelete(onFolderEvent(protocol_1.FileChangeType.Delete));
    return new CompositeDisposable_1.default(watcher, d1, d2, d3, watcherForFolders, d4);
}
function forwardChanges(server) {
    // combine file watching and text document watching
    return new CompositeDisposable_1.default(forwardDocumentChanges(server), forwardFileChanges(server));
}
exports.default = forwardChanges;
//# sourceMappingURL=changeForwarding.js.map