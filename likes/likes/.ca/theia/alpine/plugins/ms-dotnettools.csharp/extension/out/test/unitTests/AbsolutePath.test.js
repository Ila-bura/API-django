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
const chai_1 = require("chai");
const AbsolutePath_1 = require("../../src/packageManager/AbsolutePath");
const CreateTmpAsset_1 = require("../../src/CreateTmpAsset");
const path_1 = require("path");
suite(AbsolutePath_1.AbsolutePath.name, () => {
    let tmpPath;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        tmpPath = yield CreateTmpAsset_1.CreateTmpFile();
    }));
    teardown(() => {
        tmpPath.dispose();
    });
    test('Throws error when the passed value is not an absolute path', () => {
        chai_1.expect(() => new AbsolutePath_1.AbsolutePath("somePath")).to.throw(Error);
    });
    test(`${AbsolutePath_1.AbsolutePath.getAbsolutePath.name}: Returns an absolute path based by resolving the path with the value to prepend`, () => {
        let absolutePath = AbsolutePath_1.AbsolutePath.getAbsolutePath(tmpPath.name, "somePath");
        chai_1.expect(absolutePath.value).to.be.equal(path_1.join(tmpPath.name, "somePath"));
    });
});
//# sourceMappingURL=AbsolutePath.test.js.map