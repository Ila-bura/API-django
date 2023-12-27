"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodePath = exports.testAssetsRootPath = exports.integrationTestRunnerPath = exports.featureTestRunnerPath = exports.testRootPath = exports.codeExtensionSourcesPath = exports.codeExtensionPath = exports.unpackedExtensionPath = exports.unpackedVsixPath = exports.packedVsixOutputRoot = exports.packageJsonPath = exports.mochaPath = exports.vscePath = exports.nodeModulesPath = exports.onlineVscodeignorePath = exports.offlineVscodeignorePath = exports.vscodeignorePath = exports.rootPath = void 0;
const path = require("path");
const commandLineArguments_1 = require("./commandLineArguments");
exports.rootPath = path.resolve(__dirname, '..');
exports.vscodeignorePath = path.join(exports.rootPath, '.vscodeignore');
exports.offlineVscodeignorePath = path.join(exports.rootPath, 'offline.vscodeignore');
exports.onlineVscodeignorePath = path.join(exports.rootPath, 'release.vscodeignore');
exports.nodeModulesPath = path.join(exports.rootPath, 'node_modules');
exports.vscePath = path.join(exports.nodeModulesPath, 'vsce', 'out', 'vsce');
exports.mochaPath = path.join(exports.nodeModulesPath, 'mocha', 'bin', 'mocha');
exports.packageJsonPath = path.join(exports.rootPath, "package.json");
exports.packedVsixOutputRoot = commandLineArguments_1.commandLineOptions.outputFolder || exports.rootPath;
exports.unpackedVsixPath = path.join(exports.rootPath, "vsix");
exports.unpackedExtensionPath = path.join(exports.unpackedVsixPath, "extension");
exports.codeExtensionPath = commandLineArguments_1.commandLineOptions.codeExtensionPath || exports.rootPath;
exports.codeExtensionSourcesPath = path.join(exports.codeExtensionPath, "dist");
exports.testRootPath = path.join(exports.rootPath, "out", "test");
exports.featureTestRunnerPath = path.join(exports.testRootPath, "runFeatureTests.js");
exports.integrationTestRunnerPath = path.join(exports.testRootPath, "runIntegrationTests.js");
exports.testAssetsRootPath = path.join(exports.rootPath, "test", "integrationTests", "testAssets");
exports.nodePath = path.join(process.env.NVM_BIN
    ? `${process.env.NVM_BIN}${path.sep}`
    : '', 'node');
//# sourceMappingURL=projectPaths.js.map