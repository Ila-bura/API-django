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
class CSharpImplementationProvider extends abstractProvider_1.default {
    provideImplementation(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = typeConversion_1.createRequest(document, position);
            const implementations = yield serverUtils.findImplementations(this._server, request, token).then(response => {
                if (!response || !response.QuickFixes) {
                    return;
                }
                return response.QuickFixes.map(fix => typeConversion_1.toLocation(fix));
            }).catch();
            // Allow language middlewares to re-map its edits if necessary.
            const result = yield this._languageMiddlewareFeature.remap("remapLocations", implementations, token);
            return result;
        });
    }
}
exports.default = CSharpImplementationProvider;
//# sourceMappingURL=implementationProvider.js.map