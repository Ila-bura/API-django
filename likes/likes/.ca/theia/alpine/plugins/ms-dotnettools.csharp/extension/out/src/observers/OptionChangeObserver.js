"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowOmniSharpConfigChangePrompt = void 0;
const ShowInformationMessage_1 = require("./utils/ShowInformationMessage");
const Disposable_1 = require("../Disposable");
const operators_1 = require("rxjs/operators");
const omniSharpOptions = [
    "path",
    "useGlobalMono",
    "enableMsBuildLoadProjectsOnDemand",
    "waitForDebugger",
    "loggingLevel",
    "enableEditorConfigSupport",
    "enableDecompilationSupport",
    "enableImportCompletion",
    "organizeImportsOnFormat",
    "enableAsyncCompletion",
];
function OmniSharpOptionChangeObservable(optionObservable) {
    let options;
    return optionObservable.pipe(operators_1.filter(newOptions => {
        const changed = options && omniSharpOptions.some(key => options[key] !== newOptions[key]);
        options = newOptions;
        return changed;
    }));
}
function ShowOmniSharpConfigChangePrompt(optionObservable, vscode) {
    const subscription = OmniSharpOptionChangeObservable(optionObservable)
        .subscribe(_ => {
        let message = "OmniSharp configuration has changed. Would you like to relaunch the OmniSharp server with your changes?";
        ShowInformationMessage_1.default(vscode, message, { title: "Restart OmniSharp", command: 'o.restart' });
    });
    return new Disposable_1.default(subscription);
}
exports.ShowOmniSharpConfigChangePrompt = ShowOmniSharpConfigChangePrompt;
//# sourceMappingURL=OptionChangeObserver.js.map