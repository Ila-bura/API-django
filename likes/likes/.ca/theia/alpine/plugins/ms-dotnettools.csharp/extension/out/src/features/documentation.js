"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayDocumentationObject = exports.GetDocumentationString = exports.extractSummaryText = void 0;
const summaryStartTag = /<summary>/i;
const summaryEndTag = /<\/summary>/i;
function extractSummaryText(xmlDocComment) {
    if (!xmlDocComment) {
        return xmlDocComment;
    }
    let summary = xmlDocComment;
    let startIndex = summary.search(summaryStartTag);
    if (startIndex < 0) {
        return summary;
    }
    summary = summary.slice(startIndex + '<summary>'.length);
    let endIndex = summary.search(summaryEndTag);
    if (endIndex < 0) {
        return summary;
    }
    return summary.slice(0, endIndex);
}
exports.extractSummaryText = extractSummaryText;
function GetDocumentationString(structDoc) {
    let newLine = "\n\n";
    let documentation = "";
    if (structDoc) {
        if (structDoc.SummaryText) {
            documentation += structDoc.SummaryText + newLine;
        }
        documentation = documentation.trim();
    }
    return documentation;
}
exports.GetDocumentationString = GetDocumentationString;
function displayDocumentationObject(obj) {
    return obj.Name + ": " + obj.Documentation;
}
exports.displayDocumentationObject = displayDocumentationObject;
//# sourceMappingURL=documentation.js.map