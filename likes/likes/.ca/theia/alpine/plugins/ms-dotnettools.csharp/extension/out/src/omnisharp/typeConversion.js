"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequest = exports.toVSCodeRange = exports.toRange3 = exports.toRange2 = exports.toRange = exports.toLocationFromUri = exports.toLocation = void 0;
const vscode = require("vscode");
function toLocation(location) {
    const fileName = vscode.Uri.file(location.FileName);
    return toLocationFromUri(fileName, location);
}
exports.toLocation = toLocation;
function toLocationFromUri(uri, location) {
    const position = new vscode.Position(location.Line, location.Column);
    const endLine = location.EndLine;
    const endColumn = location.EndColumn;
    if (endLine !== undefined && endColumn !== undefined) {
        const endPosition = new vscode.Position(endLine, endColumn);
        return new vscode.Location(uri, new vscode.Range(position, endPosition));
    }
    return new vscode.Location(uri, position);
}
exports.toLocationFromUri = toLocationFromUri;
function toRange(rangeLike) {
    let { Line, Column, EndLine, EndColumn } = rangeLike;
    return toVSCodeRange(Line, Column, EndLine, EndColumn);
}
exports.toRange = toRange;
function toRange2(rangeLike) {
    let { StartLine, StartColumn, EndLine, EndColumn } = rangeLike;
    return toVSCodeRange(StartLine, StartColumn, EndLine, EndColumn);
}
exports.toRange2 = toRange2;
function toRange3(range) {
    return toVSCodeRange(range.Start.Line, range.Start.Column, range.End.Line, range.End.Column);
}
exports.toRange3 = toRange3;
function toVSCodeRange(StartLine, StartColumn, EndLine, EndColumn) {
    return new vscode.Range(StartLine, StartColumn, EndLine, EndColumn);
}
exports.toVSCodeRange = toVSCodeRange;
function createRequest(document, where, includeBuffer = false) {
    let Line, Column;
    if (where instanceof vscode.Position) {
        Line = where.line;
        Column = where.character;
    }
    else if (where instanceof vscode.Range) {
        Line = where.start.line;
        Column = where.start.character;
    }
    // for metadata sources, we need to remove the [metadata] from the filename, and prepend the $metadata$ authority
    // this is expected by the Omnisharp server to support metadata-to-metadata navigation
    let fileName = document.uri.scheme === "omnisharp-metadata" ?
        `${document.uri.authority}${document.fileName.replace("[metadata] ", "")}` :
        document.fileName;
    let request = {
        FileName: fileName,
        Buffer: includeBuffer ? document.getText() : undefined,
        Line,
        Column
    };
    return request;
}
exports.createRequest = createRequest;
//# sourceMappingURL=typeConversion.js.map