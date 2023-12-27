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
exports.run = void 0;
const path = require("path");
const Mocha = require("mocha");
const glob = require("glob-promise");
const fs = require("fs");
const logger_1 = require("../src/logger");
// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
const tty = require('tty');
if (!tty.getWindowSize) {
    tty.getWindowSize = function () { return [80, 75]; };
}
function setupLogging() {
    if (process.env.CODE_EXTENSIONS_PATH && process.env.OSVC_SUITE) {
        let logDirPath = path.join(process.env.CODE_EXTENSIONS_PATH, "./.logs");
        if (!fs.existsSync(logDirPath)) {
            fs.mkdirSync(logDirPath);
        }
        let logFilePath = path.join(logDirPath, `${process.env.OSVC_SUITE}.log`);
        logger_1.SubscribeToAllLoggers(message => fs.appendFileSync(logFilePath, message));
    }
}
function run(testsRoot, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options !== null && options !== void 0 ? options : (options = {
            ui: 'tdd',
            useColors: true
        });
        const mocha = new Mocha(options);
        setupLogging();
        // Enable source map support
        require('source-map-support').install();
        // Glob test files
        const files = yield glob('**/**.test.js', { cwd: testsRoot });
        // Fill into Mocha
        files.forEach(file => mocha.addFile(path.join(testsRoot, file)));
        return new Promise((resolve) => {
            mocha.run(resolve);
        }).then(failures => {
            if (failures > 0) {
                throw new Error(`${failures} tests failed.`);
            }
        });
    });
}
exports.run = run;
//# sourceMappingURL=testRunner.js.map