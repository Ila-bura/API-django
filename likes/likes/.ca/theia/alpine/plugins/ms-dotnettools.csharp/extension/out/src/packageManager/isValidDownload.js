"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBufferIntegrityHash = exports.isValidDownload = void 0;
const crypto = require("crypto");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
function isValidDownload(buffer, integrity, eventStream) {
    if (integrity && integrity.length > 0) {
        eventStream.post(new loggingEvents_1.DownloadValidation());
        let value = getBufferIntegrityHash(buffer);
        if (value == integrity.toUpperCase()) {
            eventStream.post(new loggingEvents_1.IntegrityCheckSuccess());
            return true;
        }
        else {
            return false;
        }
    }
    // no integrity has been specified
    return true;
}
exports.isValidDownload = isValidDownload;
function getBufferIntegrityHash(buffer) {
    let hash = crypto.createHash('sha256');
    hash.update(buffer);
    let value = hash.digest('hex').toUpperCase();
    return value;
}
exports.getBufferIntegrityHash = getBufferIntegrityHash;
//# sourceMappingURL=isValidDownload.js.map