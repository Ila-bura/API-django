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
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const projectPaths_1 = require("./projectPaths");
const packageJson_1 = require("./packageJson");
const spawnNode_1 = require("./spawnNode");
const unzipper_1 = require("unzipper");
gulp.task('vsix:release:unpackage', () => {
    const packageJSON = packageJson_1.getPackageJSON();
    const name = packageJSON.name;
    const version = packageJSON.version;
    const packageName = `${name}-${version}.vsix`;
    del.sync(projectPaths_1.unpackedVsixPath);
    return fs.createReadStream(packageName).pipe(unzipper_1.Extract({ path: projectPaths_1.unpackedVsixPath }));
});
gulp.task('vsix:release:package', (onError) => __awaiter(void 0, void 0, void 0, function* () {
    del.sync(projectPaths_1.vscodeignorePath);
    fs.copyFileSync(projectPaths_1.onlineVscodeignorePath, projectPaths_1.vscodeignorePath);
    try {
        yield spawnNode_1.default([projectPaths_1.vscePath, 'package']);
    }
    finally {
        yield del(projectPaths_1.vscodeignorePath);
    }
}));
//# sourceMappingURL=onlinePackagingTasks.js.map