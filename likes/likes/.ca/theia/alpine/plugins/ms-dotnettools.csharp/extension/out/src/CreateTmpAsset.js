"use strict";
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
exports.CreateTmpDir = exports.CreateTmpFile = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const tmp = require("tmp");
const async_file_1 = require("async-file");
const NestedError_1 = require("./NestedError");
function CreateTmpFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpFile = yield new Promise((resolve, reject) => {
            tmp.file({ prefix: 'package-' }, (err, path, fd, cleanupCallback) => {
                if (err) {
                    return reject(new NestedError_1.NestedError('Error from tmp.file', err));
                }
                if (fd == 0) {
                    return reject(new NestedError_1.NestedError("Temporary package file unavailable"));
                }
                resolve({ name: path, fd: fd, removeCallback: cleanupCallback });
            });
        });
        return {
            fd: tmpFile.fd,
            name: tmpFile.name,
            dispose: tmpFile.removeCallback
        };
    });
}
exports.CreateTmpFile = CreateTmpFile;
function CreateTmpDir(unsafeCleanup) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpDir = yield new Promise((resolve, reject) => {
            tmp.dir({ unsafeCleanup }, (err, path, cleanupCallback) => {
                if (err) {
                    return reject(new NestedError_1.NestedError('Error from tmp.dir', err));
                }
                resolve({ name: path, removeCallback: cleanupCallback });
            });
        });
        return {
            fd: tmpDir.fd,
            name: tmpDir.name,
            dispose: () => {
                if (unsafeCleanup) {
                    async_file_1.rimraf(tmpDir.name); //to delete directories that have folders inside them
                }
                else {
                    tmpDir.removeCallback();
                }
            }
        };
    });
}
exports.CreateTmpDir = CreateTmpDir;
//# sourceMappingURL=CreateTmpAsset.js.map