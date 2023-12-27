"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditorAdapter = void 0;
class TextEditorAdapter {
    constructor(textEditor) {
        this.textEditor = textEditor;
    }
    get document() {
        return this.textEditor.document;
    }
}
exports.TextEditorAdapter = TextEditorAdapter;
//# sourceMappingURL=textEditorAdapter.js.map