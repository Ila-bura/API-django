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
const typeConversion_1 = require("../omnisharp/typeConversion");
const vscode_1 = require("vscode");
class OmnisharpDocumentHighlightProvider extends abstractProvider_1.default {
    provideDocumentHighlights(resource, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(resource, position);
            req.OnlyThisFile = true;
            req.ExcludeDefinition = false;
            try {
                let res = yield serverUtils.findUsages(this._server, req, token);
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(OmnisharpDocumentHighlightProvider._asDocumentHighlight);
                }
            }
            catch (error) {
                return [];
            }
        });
    }
    static _asDocumentHighlight(quickFix) {
        return new vscode_1.DocumentHighlight(typeConversion_1.toRange(quickFix), vscode_1.DocumentHighlightKind.Read);
    }
}
exports.default = OmnisharpDocumentHighlightProvider;
//# sourceMappingURL=documentHighlightProvider.js.map