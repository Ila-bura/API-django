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
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const vscode_1 = require("vscode");
class FormattingSupport extends abstractProvider_1.default {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
                Line: range.start.line,
                Column: range.start.character,
                EndLine: range.end.line,
                EndColumn: range.end.character
            };
            try {
                let res = yield serverUtils.formatRange(this._server, request, token);
                if (res && Array.isArray(res.Changes)) {
                    return res.Changes.map(FormattingSupport._asEditOptionation);
                }
            }
            catch (error) {
                return [];
            }
        });
    }
    provideOnTypeFormattingEdits(document, position, ch, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
                Line: position.line,
                Column: position.character,
                Character: ch
            };
            try {
                let res = yield serverUtils.formatAfterKeystroke(this._server, request, token);
                if (res && Array.isArray(res.Changes)) {
                    return res.Changes.map(FormattingSupport._asEditOptionation);
                }
            }
            catch (error) {
                return [];
            }
        });
    }
    static _asEditOptionation(change) {
        return new vscode_1.TextEdit(new vscode_1.Range(change.StartLine, change.StartColumn, change.EndLine, change.EndColumn), change.NewText);
    }
}
exports.default = FormattingSupport;
//# sourceMappingURL=formattingEditProvider.js.map