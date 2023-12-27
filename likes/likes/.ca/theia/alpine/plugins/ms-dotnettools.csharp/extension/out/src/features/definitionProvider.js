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
const serverUtils = require("../omnisharp/utils");
const vscode_1 = require("vscode");
const typeConversion_1 = require("../omnisharp/typeConversion");
const abstractProvider_1 = require("./abstractProvider");
class CSharpDefinitionProvider extends abstractProvider_1.default {
    constructor(server, definitionMetadataDocumentProvider, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this._definitionMetadataDocumentProvider = definitionMetadataDocumentProvider;
    }
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.WantMetadata = true;
            let location;
            try {
                let gotoDefinitionResponse = yield serverUtils.goToDefinition(this._server, req, token);
                // the defintion is in source
                if (gotoDefinitionResponse && gotoDefinitionResponse.FileName) {
                    // if it is part of an already used metadata file, retrieve its uri instead of going to the physical file
                    if (gotoDefinitionResponse.FileName.startsWith("$metadata$")) {
                        const uri = this._definitionMetadataDocumentProvider.getExistingMetadataResponseUri(gotoDefinitionResponse.FileName);
                        location = typeConversion_1.toLocationFromUri(uri, gotoDefinitionResponse);
                    }
                    else {
                        // if it is a normal source definition, convert the response to a location
                        location = typeConversion_1.toLocation(gotoDefinitionResponse);
                    }
                    // the definition is in metadata
                }
                else if (gotoDefinitionResponse.MetadataSource) {
                    const metadataSource = gotoDefinitionResponse.MetadataSource;
                    // go to metadata endpoint for more information
                    const metadataResponse = yield serverUtils.getMetadata(this._server, {
                        Timeout: 5000,
                        AssemblyName: metadataSource.AssemblyName,
                        VersionNumber: metadataSource.VersionNumber,
                        ProjectName: metadataSource.ProjectName,
                        Language: metadataSource.Language,
                        TypeName: metadataSource.TypeName
                    });
                    if (!metadataResponse || !metadataResponse.Source || !metadataResponse.SourceName) {
                        return;
                    }
                    const uri = this._definitionMetadataDocumentProvider.addMetadataResponse(metadataResponse);
                    location = new vscode_1.Location(uri, new vscode_1.Position(gotoDefinitionResponse.Line, gotoDefinitionResponse.Column));
                }
                // Allow language middlewares to re-map its edits if necessary.
                const result = yield this._languageMiddlewareFeature.remap("remapLocations", [location], token);
                return result;
            }
            catch (error) {
                return [];
            }
        });
    }
}
exports.default = CSharpDefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map