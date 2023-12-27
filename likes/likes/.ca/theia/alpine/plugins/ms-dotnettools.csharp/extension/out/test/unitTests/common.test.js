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
const path = require("path");
const common_1 = require("../../src/common");
const chai_1 = require("chai");
suite("Common", () => {
    suiteSetup(() => chai_1.should());
    suite("buildPromiseChain", () => {
        test("produce a sequence of promises", () => __awaiter(void 0, void 0, void 0, function* () {
            let array = [];
            let items = [1, 2, 3, 4, 5];
            let promise = common_1.buildPromiseChain(items, (n) => __awaiter(void 0, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    array.push(n);
                    resolve();
                });
            }));
            return promise.then(() => {
                array.should.deep.equal([1, 2, 3, 4, 5]);
            });
        }));
    });
    suite("safeLength", () => {
        test("return 0 for empty array", () => {
            let array = [];
            let result = common_1.safeLength(array);
            result.should.equal(0);
        });
        test("returns 5 for array of 5 elements", () => {
            let array = [1, 2, 3, 4, 5];
            let result = common_1.safeLength(array);
            result.should.equal(5);
        });
        test("returns 0 for undefined", () => {
            let array = undefined;
            let result = common_1.safeLength(array);
            result.should.equal(0);
        });
    });
    suite("sum", () => {
        test("produce total from numbers", () => {
            let array = [1, 2, 3, 4, 5];
            let result = common_1.sum(array, i => i);
            result.should.equal(15);
        });
        test("produce total from lengths of arrays", () => {
            let array = [[1, 2], [3], [], [4, 5, 6]];
            let result = common_1.sum(array, i => i.length);
            result.should.equal(6);
        });
        test("produce total of true values from array of booleans", () => {
            let array = [true, false, false, true, true, true, false, true];
            let result = common_1.sum(array, b => b ? 1 : 0);
            result.should.equal(5);
        });
    });
    suite("isSubfolderOf", () => {
        test("same paths", () => {
            let subfolder = ["C:", "temp", "VS", "dotnetProject"].join(path.sep);
            let folder = ["C:", "temp", "VS", "dotnetProject"].join(path.sep);
            chai_1.expect(common_1.isSubfolderOf(subfolder, folder)).to.be.true;
        });
        test("correct subfolder", () => {
            let subfolder = ["C:", "temp", "VS"].join(path.sep);
            let folder = ["C:", "temp", "VS", "dotnetProject"].join(path.sep);
            chai_1.expect(common_1.isSubfolderOf(subfolder, folder)).to.be.true;
        });
        test("longer subfolder", () => {
            let subfolder = ["C:", "temp", "VS", "a", "b", "c"].join(path.sep);
            let folder = ["C:", "temp", "VS"].join(path.sep);
            chai_1.expect(common_1.isSubfolderOf(subfolder, folder)).to.be.false;
        });
        test("Different drive", () => {
            let subfolder = ["C:", "temp", "VS"].join(path.sep);
            let folder = ["E:", "temp", "VS"].join(path.sep);
            chai_1.expect(common_1.isSubfolderOf(subfolder, folder)).to.be.false;
        });
    });
});
//# sourceMappingURL=common.test.js.map