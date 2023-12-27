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
const archiver = require("archiver");
class TestZip {
    constructor(_buffer, _files) {
        this._buffer = _buffer;
        this._files = _files;
    }
    get buffer() {
        return this._buffer;
    }
    get size() {
        return this._buffer.length;
    }
    get files() {
        return this._files;
    }
    static createTestZipAsync(...filesToAdd) {
        return __awaiter(this, void 0, void 0, function* () {
            let buffers = [];
            let finalBuffer = yield new Promise((resolve, reject) => {
                let archive = archiver('zip');
                archive.on('warning', function (err) {
                    if (err.code === 'ENOENT') {
                        console.log(err);
                    }
                    else {
                        // throw error
                        reject(err);
                    }
                });
                archive.on('data', data => buffers.push(data));
                archive.on('error', reject);
                archive.on('end', () => resolve(Buffer.concat(buffers)));
                filesToAdd.forEach(elem => archive.append(elem.content, { name: elem.path }));
                archive.finalize();
            });
            return new TestZip(finalBuffer, filesToAdd);
        });
    }
}
exports.default = TestZip;
//# sourceMappingURL=TestZip.js.map