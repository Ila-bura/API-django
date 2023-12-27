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
exports.LanguageMiddlewareFeature = void 0;
const vscode = require("vscode");
class LanguageMiddlewareFeature {
    constructor() {
        this._middlewares = [];
    }
    dispose() {
        this._registration.dispose();
    }
    register() {
        this._registration = vscode.commands.registerCommand('omnisharp.registerLanguageMiddleware', (middleware) => {
            this._middlewares.push(middleware);
        });
    }
    getLanguageMiddlewares() {
        return this._middlewares;
    }
    remap(remapType, original, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const languageMiddlewares = this.getLanguageMiddlewares();
                let remapped = original;
                for (const middleware of languageMiddlewares) {
                    // Commit a type crime because we know better than the compiler
                    const method = middleware[remapType];
                    if (!method) {
                        continue;
                    }
                    const result = yield method.call(middleware, remapped, token);
                    if (result) {
                        remapped = result;
                    }
                }
                return remapped;
            }
            catch (error) {
                // Something happened while remapping. Return the original.
                return original;
            }
        });
    }
}
exports.LanguageMiddlewareFeature = LanguageMiddlewareFeature;
//# sourceMappingURL=LanguageMiddlewareFeature.js.map