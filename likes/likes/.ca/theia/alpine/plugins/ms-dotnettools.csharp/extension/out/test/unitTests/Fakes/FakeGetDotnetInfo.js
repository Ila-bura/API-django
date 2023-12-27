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
exports.FakeGetDotnetInfo = exports.fakeDotnetInfo = void 0;
exports.fakeDotnetInfo = {
    FullInfo: "myDotnetInfo",
    Version: "1.0.x",
    OsVersion: "Fake86",
    RuntimeId: "1.1.x"
};
const FakeGetDotnetInfo = () => __awaiter(void 0, void 0, void 0, function* () { return Promise.resolve(exports.fakeDotnetInfo); });
exports.FakeGetDotnetInfo = FakeGetDotnetInfo;
//# sourceMappingURL=FakeGetDotnetInfo.js.map