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
class OmnisharpWorkspaceSymbolProvider extends abstractProvider_1.default {
    constructor(server, optionProvider, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this.optionProvider = optionProvider;
    }
    provideWorkspaceSymbols(search, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.optionProvider.GetLatestOptions();
            let minFilterLength = options.minFindSymbolsFilterLength > 0 ? options.minFindSymbolsFilterLength : undefined;
            let maxItemsToReturn = options.maxFindSymbolsItems > 0 ? options.maxFindSymbolsItems : undefined;
            if (minFilterLength != undefined && search.length < minFilterLength) {
                return [];
            }
            try {
                let res = yield serverUtils.findSymbols(this._server, { Filter: search, MaxItemsToReturn: maxItemsToReturn, FileName: '' }, token);
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(OmnisharpWorkspaceSymbolProvider._asSymbolInformation);
                }
            }
            catch (error) {
                return [];
            }
        });
    }
    static _asSymbolInformation(symbolInfo) {
        return new vscode_1.SymbolInformation(symbolInfo.Text, OmnisharpWorkspaceSymbolProvider._toKind(symbolInfo), typeConversion_1.toRange(symbolInfo), vscode_1.Uri.file(symbolInfo.FileName));
    }
    static _toKind(symbolInfo) {
        switch (symbolInfo.Kind) {
            case 'Method':
                return vscode_1.SymbolKind.Method;
            case 'Field':
                return vscode_1.SymbolKind.Field;
            case 'Property':
                return vscode_1.SymbolKind.Property;
            case 'Interface':
                return vscode_1.SymbolKind.Interface;
            case 'Enum':
                return vscode_1.SymbolKind.Enum;
            case 'Struct':
                return vscode_1.SymbolKind.Struct;
            case 'Event':
                return vscode_1.SymbolKind.Event;
            case 'EnumMember':
                return vscode_1.SymbolKind.EnumMember;
            case 'Class':
                return vscode_1.SymbolKind.Class;
            default:
                return vscode_1.SymbolKind.Class;
        }
    }
}
exports.default = OmnisharpWorkspaceSymbolProvider;
//# sourceMappingURL=workspaceSymbolProvider.js.map