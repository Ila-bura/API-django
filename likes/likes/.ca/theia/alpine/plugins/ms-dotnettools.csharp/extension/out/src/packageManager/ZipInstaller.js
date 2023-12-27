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
exports.InstallZip = void 0;
const fs = require("fs");
const async_file_1 = require("async-file");
const path = require("path");
const yauzl = require("yauzl");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const NestedError_1 = require("../NestedError");
function InstallZip(buffer, description, destinationInstallPath, binaries, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        eventStream.post(new loggingEvents_1.InstallationStart(description));
        return new Promise((resolve, reject) => {
            yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    let message = "C# Extension was unable to download its dependencies. Please check your internet connection. If you use a proxy server, please visit https://aka.ms/VsCodeCsharpNetworking";
                    eventStream.post(new loggingEvents_1.ZipError(message));
                    return reject(new NestedError_1.NestedError(message));
                }
                zipFile.readEntry();
                zipFile.on('entry', (entry) => __awaiter(this, void 0, void 0, function* () {
                    let absoluteEntryPath = path.resolve(destinationInstallPath.value, entry.fileName);
                    if (entry.fileName.endsWith('/')) {
                        // Directory - create it
                        try {
                            yield async_file_1.mkdirp(absoluteEntryPath, 0o775);
                            zipFile.readEntry();
                        }
                        catch (err) {
                            return reject(new NestedError_1.NestedError('Error creating directory for zip directory entry:' + (err === null || err === void 0 ? void 0 : err.code) || '', err));
                        }
                    }
                    else {
                        // File - extract it
                        zipFile.openReadStream(entry, (err, readStream) => __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                return reject(new NestedError_1.NestedError('Error reading zip stream', err));
                            }
                            try {
                                yield async_file_1.mkdirp(path.dirname(absoluteEntryPath), 0o775);
                                let binaryPaths = binaries && binaries.map(binary => binary.value);
                                // Make sure executable files have correct permissions when extracted
                                let fileMode = binaryPaths && binaryPaths.indexOf(absoluteEntryPath) !== -1
                                    ? 0o755
                                    : 0o664;
                                readStream.pipe(fs.createWriteStream(absoluteEntryPath, { mode: fileMode }));
                                readStream.on('end', () => zipFile.readEntry());
                            }
                            catch (err) {
                                return reject(new NestedError_1.NestedError('Error creating directory for zip file entry', err));
                            }
                        }));
                    }
                }));
                zipFile.on('end', () => {
                    resolve();
                });
                zipFile.on('error', err => {
                    reject(new NestedError_1.NestedError('Zip File Error:' + err.code || '', err));
                });
            });
        });
    });
}
exports.InstallZip = InstallZip;
//# sourceMappingURL=ZipInstaller.js.map