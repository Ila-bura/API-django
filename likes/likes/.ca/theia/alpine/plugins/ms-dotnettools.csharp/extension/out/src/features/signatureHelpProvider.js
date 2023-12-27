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
const vscode_2 = require("vscode");
class OmniSharpSignatureHelpProvider extends abstractProvider_1.default {
    provideSignatureHelp(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            try {
                let res = yield serverUtils.signatureHelp(this._server, req, token);
                if (!res) {
                    return undefined;
                }
                let ret = new vscode_1.SignatureHelp();
                ret.activeSignature = res.ActiveSignature;
                ret.activeParameter = res.ActiveParameter;
                for (let signature of res.Signatures) {
                    let signatureInfo = new vscode_1.SignatureInformation(signature.Label, signature.StructuredDocumentation.SummaryText);
                    ret.signatures.push(signatureInfo);
                    for (let parameter of signature.Parameters) {
                        let parameterInfo = new vscode_1.ParameterInformation(parameter.Label, this.GetParameterDocumentation(parameter));
                        signatureInfo.parameters.push(parameterInfo);
                    }
                }
                return ret;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    GetParameterDocumentation(parameter) {
        let summary = parameter.Documentation;
        if (summary.length > 0) {
            let paramText = `**${parameter.Name}**: ${summary}`;
            return new vscode_2.MarkdownString(paramText);
        }
        return "";
    }
}
exports.default = OmniSharpSignatureHelpProvider;
//# sourceMappingURL=signatureHelpProvider.js.map