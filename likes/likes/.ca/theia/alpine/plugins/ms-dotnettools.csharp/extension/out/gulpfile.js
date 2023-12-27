"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const optionsSchemaGenerator = require("./src/tools/GenerateOptionsSchema");
const packageDependencyUpdater = require("./src/tools/UpdatePackageDependencies");
const gulp_tslint_1 = require("gulp-tslint");
require('./tasks/testTasks');
require('./tasks/onlinePackagingTasks');
require('./tasks/offlinePackagingTasks');
require('./tasks/backcompatTasks');
// Disable warning about wanting an async function
// tslint:disable-next-line
gulp.task('generateOptionsSchema', () => {
    optionsSchemaGenerator.GenerateOptionsSchema();
    return Promise.resolve();
});
// Disable warning about wanting an async function
// tslint:disable-next-line
gulp.task('updatePackageDependencies', () => {
    return packageDependencyUpdater.updatePackageDependencies();
});
gulp.task('tslint', () => {
    return gulp.src([
        '**/*.ts',
        '!**/*.d.ts',
        '!**/typings**',
        '!node_modules/**',
        '!vsix/**'
    ])
        .pipe(gulp_tslint_1.default({
        program: require('tslint').Linter.createProgram("./tsconfig.json"),
        configuration: "./tslint.json"
    }))
        .pipe(gulp_tslint_1.default.report({
        summarizeFailureOutput: false,
        emitError: false
    }));
});
//# sourceMappingURL=gulpfile.js.map