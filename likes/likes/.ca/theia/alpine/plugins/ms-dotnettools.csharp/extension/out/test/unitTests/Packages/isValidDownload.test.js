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
const isValidDownload_1 = require("../../../src/packageManager/isValidDownload");
const chai = require("chai");
const EventStream_1 = require("../../../src/EventStream");
chai.should();
const expect = chai.expect;
suite(`${isValidDownload_1.isValidDownload.name}`, () => {
    const sampleBuffer = Buffer.from("sampleBuffer");
    const validIntegrity = "eb7201b5d986919e0ac67c820886358869d8f7059193d33c902ad7fe1688e1e9";
    test('Returns false for non-matching integrity', () => __awaiter(void 0, void 0, void 0, function* () {
        let result = yield isValidDownload_1.isValidDownload(sampleBuffer, "inValidIntegrity", new EventStream_1.EventStream());
        expect(result).to.be.false;
    }));
    test('Returns true for matching integrity', () => __awaiter(void 0, void 0, void 0, function* () {
        let result = yield isValidDownload_1.isValidDownload(sampleBuffer, validIntegrity, new EventStream_1.EventStream());
        expect(result).to.be.true;
    }));
    test('Returns true if no integrity has been specified', () => __awaiter(void 0, void 0, void 0, function* () {
        let result = yield isValidDownload_1.isValidDownload(sampleBuffer, undefined, new EventStream_1.EventStream());
        expect(result).to.be.true;
    }));
});
//# sourceMappingURL=isValidDownload.test.js.map