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
const gulp = require("gulp");
const path = require("path");
const projectPaths_1 = require("./projectPaths");
const spawnNode_1 = require("./spawnNode");
gulp.task("test:feature", () => __awaiter(void 0, void 0, void 0, function* () {
    let env = {
        OSVC_SUITE: "featureTests",
        CODE_EXTENSIONS_PATH: projectPaths_1.codeExtensionPath,
        CODE_TESTS_PATH: path.join(projectPaths_1.testRootPath, "featureTests"),
        CODE_WORKSPACE_ROOT: projectPaths_1.rootPath,
    };
    return spawnNode_1.default([projectPaths_1.featureTestRunnerPath], { env });
}));
gulp.task("test:unit", () => __awaiter(void 0, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.mochaPath,
        '--ui',
        'tdd',
        '-c',
        'test/unitTests/**/*.test.ts'
    ]);
}));
gulp.task("test:integration:singleCsproj", () => __awaiter(void 0, void 0, void 0, function* () {
    return runIntegrationTest("singleCsproj");
}));
gulp.task("test:integration:slnWithCsproj", () => __awaiter(void 0, void 0, void 0, function* () {
    return runIntegrationTest("slnWithCsproj");
}));
gulp.task("test:integration:slnFilterWithCsproj", () => __awaiter(void 0, void 0, void 0, function* () {
    return runIntegrationTest("slnFilterWithCsproj");
}));
gulp.task("test:integration:BasicRazorApp2_1", () => __awaiter(void 0, void 0, void 0, function* () {
    return runIntegrationTest("BasicRazorApp2_1");
}));
gulp.task("test:integration", gulp.series("test:integration:singleCsproj", "test:integration:slnWithCsproj", "test:integration:slnFilterWithCsproj", "test:integration:BasicRazorApp2_1"));
gulp.task("test", gulp.series("test:feature", "test:unit", "test:integration"));
function runIntegrationTest(testAssetName) {
    return __awaiter(this, void 0, void 0, function* () {
        let env = {
            OSVC_SUITE: testAssetName,
            CODE_TESTS_PATH: path.join(projectPaths_1.testRootPath, "integrationTests"),
            CODE_EXTENSIONS_PATH: projectPaths_1.codeExtensionPath,
            CODE_TESTS_WORKSPACE: path.join(projectPaths_1.testAssetsRootPath, testAssetName),
            CODE_WORKSPACE_ROOT: projectPaths_1.rootPath,
        };
        const result = yield spawnNode_1.default([projectPaths_1.integrationTestRunnerPath], { env, cwd: projectPaths_1.rootPath });
        if (result.code > 0) {
            // Ensure that gulp fails when tests fail
            throw new Error(`Exit code: ${result.code}  Signal: ${result.signal}`);
        }
        return result;
    });
}
//# sourceMappingURL=testTasks.js.map