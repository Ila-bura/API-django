"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
let workspace = {
    description: "sln with several csproj's",
    projects: [{
            relativeFilePath: "src/app/app.csproj"
        }, {
            relativeFilePath: "src/lib/lib.csproj"
        }, {
            relativeFilePath: "test/test.csproj"
        }]
};
exports.default = workspace;
//# sourceMappingURL=slnWithCsproj.js.map