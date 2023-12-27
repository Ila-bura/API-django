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
class OmniSharpHoverProvider extends abstractProvider_1.default {
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = typeConversion_1.createRequest(document, position);
            try {
                const response = yield serverUtils.getQuickInfo(this._server, request, token);
                if (!response || !response.Markdown) {
                    return undefined;
                }
                const markdownString = new vscode_1.MarkdownString;
                markdownString.appendMarkdown(response.Markdown);
                return new vscode_1.Hover(markdownString);
            }
            catch (error) {
                return undefined;
            }
        });
    }
}
exports.default = OmniSharpHoverProvider;
//# sourceMappingURL=hoverProvider.js.map