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
const chai = require("chai");
const fs = require("async-file");
const glob = require("glob-promise");
const path = require("path");
let vsixFiles = glob.sync(path.join(process.cwd(), '**', '*.vsix'));
suite("Omnisharp-Vscode VSIX", () => __awaiter(void 0, void 0, void 0, function* () {
    suiteSetup(() => __awaiter(void 0, void 0, void 0, function* () {
        chai.should();
    }));
    test("At least one vsix file should be produced", () => {
        vsixFiles.length.should.be.greaterThan(0, "the build should produce at least one vsix file");
    });
    vsixFiles.forEach(element => {
        const sizeInMB = 5;
        const maximumVsixSizeInBytes = sizeInMB * 1024 * 1024;
        suite(`Given ${element}`, () => {
            test(`Then its size is less than ${sizeInMB}MB`, () => __awaiter(void 0, void 0, void 0, function* () {
                const stats = yield fs.stat(element);
                stats.size.should.be.lessThan(maximumVsixSizeInBytes);
            }));
            test(`Then it should not be empty`, () => __awaiter(void 0, void 0, void 0, function* () {
                const stats = yield fs.stat(element);
                stats.size.should.be.greaterThan(0);
            }));
        });
    });
}));
//# sourceMappingURL=vsix.test.js.map