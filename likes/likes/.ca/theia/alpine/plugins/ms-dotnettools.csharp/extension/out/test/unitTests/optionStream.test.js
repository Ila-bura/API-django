"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("./testAssets/Fakes");
const Disposable_1 = require("../../src/Disposable");
const GetConfigChangeEvent_1 = require("./testAssets/GetConfigChangeEvent");
const CreateOptionStream_1 = require("../../src/observables/CreateOptionStream");
suite('OptionStream', () => {
    suiteSetup(() => chai_1.should());
    let listenerFunction;
    let vscode;
    let optionStream;
    let disposeCalled;
    setup(() => {
        listenerFunction = new Array();
        vscode = getVSCode(listenerFunction);
        optionStream = CreateOptionStream_1.default(vscode);
        disposeCalled = false;
    });
    suite('Returns the recent options to the subscriber', () => {
        let subscription;
        let options;
        setup(() => {
            subscription = optionStream.subscribe(newOptions => options = newOptions);
        });
        test('Returns the default options if there is no change', () => {
            chai_1.expect(options.path).to.be.null;
            options.useGlobalMono.should.equal("auto");
            options.waitForDebugger.should.equal(false);
            options.loggingLevel.should.equal("information");
            options.autoStart.should.equal(true);
            options.projectLoadTimeout.should.equal(60);
            options.maxProjectResults.should.equal(250);
            options.useEditorFormattingSettings.should.equal(true);
            options.useFormatting.should.equal(true);
            options.showReferencesCodeLens.should.equal(true);
            options.showTestsCodeLens.should.equal(true);
            options.disableCodeActions.should.equal(false);
            options.minFindSymbolsFilterLength.should.equal(0);
            options.maxFindSymbolsItems.should.equal(1000);
            options.enableMsBuildLoadProjectsOnDemand.should.equal(false);
            options.enableRoslynAnalyzers.should.equal(false);
            options.enableEditorConfigSupport.should.equal(false);
            options.enableDecompilationSupport.should.equal(false);
            options.enableImportCompletion.should.equal(false);
            options.enableAsyncCompletion.should.equal(false);
            chai_1.expect(options.defaultLaunchSolution).to.be.undefined;
        });
        test('Gives the changed option when the omnisharp config changes', () => {
            chai_1.expect(options.path).to.be.null;
            let changingConfig = "omnisharp";
            Fakes_1.updateConfig(vscode, changingConfig, 'path', "somePath");
            listenerFunction.forEach(listener => listener(GetConfigChangeEvent_1.GetConfigChangeEvent(changingConfig)));
            options.path.should.equal("somePath");
        });
        test('Gives the changed option when the csharp config changes', () => {
            options.disableCodeActions.should.equal(false);
            let changingConfig = "csharp";
            Fakes_1.updateConfig(vscode, changingConfig, 'disableCodeActions', true);
            listenerFunction.forEach(listener => listener(GetConfigChangeEvent_1.GetConfigChangeEvent(changingConfig)));
            options.disableCodeActions.should.equal(true);
        });
        teardown(() => {
            options = undefined;
            listenerFunction = undefined;
            subscription.unsubscribe();
            subscription = undefined;
        });
    });
    test('Dispose is called when the last subscriber unsubscribes', () => {
        disposeCalled.should.equal(false);
        let subscription1 = optionStream.subscribe(_ => { });
        let subscription2 = optionStream.subscribe(_ => { });
        let subscription3 = optionStream.subscribe(_ => { });
        subscription1.unsubscribe();
        disposeCalled.should.equal(false);
        subscription2.unsubscribe();
        disposeCalled.should.equal(false);
        subscription3.unsubscribe();
        disposeCalled.should.equal(true);
    });
    function getVSCode(listenerFunction) {
        let vscode = Fakes_1.getVSCodeWithConfig();
        vscode.workspace.onDidChangeConfiguration = (listener, thisArgs, disposables) => {
            listenerFunction.push(listener);
            return new Disposable_1.default(() => disposeCalled = true);
        };
        return vscode;
    }
});
//# sourceMappingURL=optionStream.test.js.map