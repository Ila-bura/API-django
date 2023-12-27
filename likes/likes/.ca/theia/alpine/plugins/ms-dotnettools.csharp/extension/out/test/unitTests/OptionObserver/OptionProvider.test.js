"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Fakes_1 = require("../testAssets/Fakes");
const OptionProvider_1 = require("../../../src/observers/OptionProvider");
const rxjs_1 = require("rxjs");
const options_1 = require("../../../src/omnisharp/options");
suite('OptionProvider', () => {
    suiteSetup(() => chai_1.should());
    let vscode;
    let optionProvider;
    let optionObservable;
    setup(() => {
        vscode = Fakes_1.getVSCodeWithConfig();
        optionObservable = new rxjs_1.Subject();
        optionProvider = new OptionProvider_1.default(optionObservable);
    });
    test("Throws exception when no options are pushed", () => {
        chai_1.expect(optionProvider.GetLatestOptions).to.throw();
    });
    test("Gives the latest options when options are changed", () => {
        let changingConfig = "omnisharp";
        Fakes_1.updateConfig(vscode, changingConfig, 'path', "somePath");
        optionObservable.next(options_1.Options.Read(vscode));
        Fakes_1.updateConfig(vscode, changingConfig, 'path', "anotherPath");
        optionObservable.next(options_1.Options.Read(vscode));
        let options = optionProvider.GetLatestOptions();
        chai_1.expect(options.path).to.be.equal("anotherPath");
    });
});
//# sourceMappingURL=OptionProvider.test.js.map