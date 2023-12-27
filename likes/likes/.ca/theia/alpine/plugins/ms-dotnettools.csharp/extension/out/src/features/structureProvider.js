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
exports.StructureProvider = void 0;
const vscode_1 = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const utils_1 = require("../omnisharp/utils");
class StructureProvider extends abstractProvider_1.default {
    provideFoldingRanges(document, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
            };
            try {
                let response = yield utils_1.blockStructure(this._server, request, token);
                let ranges = [];
                for (let member of response.Spans) {
                    ranges.push(new vscode_1.FoldingRange(member.Range.Start.Line, member.Range.End.Line, this.GetType(member.Kind)));
                }
                return ranges;
            }
            catch (error) {
                return [];
            }
        });
    }
    GetType(type) {
        switch (type) {
            case "Comment":
                return vscode_1.FoldingRangeKind.Comment;
            case "Imports":
                return vscode_1.FoldingRangeKind.Imports;
            case "Region":
                return vscode_1.FoldingRangeKind.Region;
            default:
                return null;
        }
    }
}
exports.StructureProvider = StructureProvider;
//# sourceMappingURL=structureProvider.js.map