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
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const OptionChangeObserver_1 = require("../../../src/observers/OptionChangeObserver");
const options_1 = require("../../../src/omnisharp/options");
chai_1.use(require('chai-as-promised'));
chai_1.use(require('chai-string'));
suite("OmniSharpConfigChangeObserver", () => {
    suiteSetup(() => chai_1.should());
    let doClickOk;
    let doClickCancel;
    let signalCommandDone;
    let commandDone;
    let vscode;
    let infoMessage;
    let invokedCommand;
    let optionObservable;
    setup(() => {
        vscode = getVSCode();
        optionObservable = new rxjs_1.BehaviorSubject(options_1.Options.Read(vscode));
        OptionChangeObserver_1.ShowOmniSharpConfigChangePrompt(optionObservable, vscode);
        commandDone = new Promise(resolve => {
            signalCommandDone = () => { resolve(); };
        });
    });
    [
        { config: "omnisharp", section: "path", value: "somePath" },
        { config: "omnisharp", section: "waitForDebugger", value: true },
        { config: "omnisharp", section: "enableMsBuildLoadProjectsOnDemand", value: true },
        { config: "omnisharp", section: "useGlobalMono", value: "always" },
        { config: "omnisharp", section: 'loggingLevel', value: 'verbose' }
    ].forEach(elem => {
        suite(`When the ${elem.config} ${elem.section} changes`, () => {
            setup(() => {
                chai_1.expect(infoMessage).to.be.undefined;
                chai_1.expect(invokedCommand).to.be.undefined;
                Fakes_1.updateConfig(vscode, elem.config, elem.section, elem.value);
                optionObservable.next(options_1.Options.Read(vscode));
            });
            test(`The information message is shown`, () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(infoMessage).to.be.equal("OmniSharp configuration has changed. Would you like to relaunch the OmniSharp server with your changes?");
            }));
            test('Given an information message if the user clicks cancel, the command is not executed', () => __awaiter(void 0, void 0, void 0, function* () {
                doClickCancel();
                yield chai_1.expect(rxjs_1.from(commandDone).pipe(operators_1.timeout(1)).toPromise()).to.be.rejected;
                chai_1.expect(invokedCommand).to.be.undefined;
            }));
            test('Given an information message if the user clicks Restore, the command is executed', () => __awaiter(void 0, void 0, void 0, function* () {
                doClickOk();
                yield commandDone;
                chai_1.expect(invokedCommand).to.be.equal("o.restart");
            }));
        });
    });
    suite('Information Message is not shown on change in', () => {
        [
            { config: "csharp", section: 'disableCodeActions', value: true },
            { config: "csharp", section: 'testsCodeLens.enabled', value: false },
            { config: "omnisharp", section: 'referencesCodeLens.enabled', value: false },
            { config: "csharp", section: 'format.enable', value: false },
            { config: "omnisharp", section: 'useEditorFormattingSettings', value: false },
            { config: "omnisharp", section: 'maxProjectResults', value: 1000 },
            { config: "omnisharp", section: 'projectLoadTimeout', value: 1000 },
            { config: "omnisharp", section: 'autoStart', value: false }
        ].forEach(elem => {
            test(`${elem.config} ${elem.section}`, () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.expect(infoMessage).to.be.undefined;
                chai_1.expect(invokedCommand).to.be.undefined;
                Fakes_1.updateConfig(vscode, elem.config, elem.section, elem.value);
                optionObservable.next(options_1.Options.Read(vscode));
                chai_1.expect(infoMessage).to.be.undefined;
            }));
        });
    });
    teardown(() => {
        infoMessage = undefined;
        invokedCommand = undefined;
        doClickCancel = undefined;
        doClickOk = undefined;
        signalCommandDone = undefined;
        commandDone = undefined;
    });
    function getVSCode() {
        let vscode = Fakes_1.getVSCodeWithConfig();
        vscode.window.showInformationMessage = (message, ...items) => __awaiter(this, void 0, void 0, function* () {
            infoMessage = message;
            return new Promise(resolve => {
                doClickCancel = () => {
                    resolve(undefined);
                };
                doClickOk = () => {
                    resolve(items[0]);
                };
            });
        });
        vscode.commands.executeCommand = (command, ...rest) => {
            invokedCommand = command;
            signalCommandDone();
            return undefined;
        };
        return vscode;
    }
});
//# sourceMappingURL=OptionChangeObserver.test.js.map