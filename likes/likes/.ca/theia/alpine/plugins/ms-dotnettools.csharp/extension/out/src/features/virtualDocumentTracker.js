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
exports.isVirtualCSharpDocument = void 0;
const vscode_1 = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
const CompositeDisposable_1 = require("../CompositeDisposable");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
function trackCurrentVirtualDocuments(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            let document = vscode_1.workspace.textDocuments[i];
            if (!shouldIgnoreDocument(document, server)) {
                yield openVirtualDocument(document, server, eventStream);
            }
        }
    });
}
function isVirtualCSharpDocument(document) {
    if (document.languageId !== 'csharp') {
        return false;
    }
    if (document.uri.scheme === 'virtualCSharp-') {
        return false;
    }
    if (!document.uri.scheme.startsWith('virtualCSharp-')) {
        return false;
    }
    return true;
}
exports.isVirtualCSharpDocument = isVirtualCSharpDocument;
function trackFutureVirtualDocuments(server, eventStream) {
    let onTextDocumentOpen = vscode_1.workspace.onDidOpenTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield openVirtualDocument(document, server, eventStream);
    }));
    let onTextDocumentChange = vscode_1.workspace.onDidChangeTextDocument((changeEvent) => __awaiter(this, void 0, void 0, function* () {
        const document = changeEvent.document;
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield changeVirtualDocument(document, server, eventStream);
    }));
    let onTextDocumentClose = vscode_1.workspace.onDidCloseTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield closeVirtualDocument(document, server, eventStream);
    }));
    // We already track text document changes for virtual documents in our change forwarder.
    return new CompositeDisposable_1.default(onTextDocumentOpen, onTextDocumentClose, onTextDocumentChange);
}
function shouldIgnoreDocument(document, server) {
    if (!isVirtualCSharpDocument(document)) {
        // We're only interested in non-physical CSharp documents.
        return true;
    }
    if (!server.isRunning()) {
        return true;
    }
    return false;
}
function openVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        let req = { FileName: path, changeType: protocol_1.FileChangeType.Create };
        try {
            yield serverUtils.filesChanged(server, [req]);
            // Trigger a change for the opening so we can get content refreshed.
            yield changeVirtualDocument(document, server, eventStream);
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function changeVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        try {
            yield serverUtils.updateBuffer(server, { Buffer: document.getText(), FileName: document.fileName });
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function closeVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        let req = { FileName: path, changeType: protocol_1.FileChangeType.Delete };
        try {
            yield serverUtils.filesChanged(server, [req]);
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function logSynchronizationFailure(uri, error, server, eventStream) {
    if (server.isRunning()) {
        eventStream.post(new loggingEvents_1.DocumentSynchronizationFailure(uri.path, error));
    }
}
function trackVirtualDocuments(server, eventStream) {
    trackCurrentVirtualDocuments(server, eventStream);
    const disposable = trackFutureVirtualDocuments(server, eventStream);
    return disposable;
}
exports.default = trackVirtualDocuments;
//# sourceMappingURL=virtualDocumentTracker.js.map