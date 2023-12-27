"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class OptionProvider {
    constructor(optionObservable) {
        this.dispose = () => {
            this.subscription.unsubscribe();
        };
        this.subscription = optionObservable.subscribe(options => this.options = options);
    }
    GetLatestOptions() {
        if (!this.options) {
            throw new Error("Error reading OmniSharp options");
        }
        return this.options;
    }
}
exports.default = OptionProvider;
//# sourceMappingURL=OptionProvider.js.map