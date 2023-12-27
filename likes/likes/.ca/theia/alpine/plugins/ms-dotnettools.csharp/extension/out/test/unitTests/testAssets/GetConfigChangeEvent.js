"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConfigChangeEvent = void 0;
function GetConfigChangeEvent(changingConfig) {
    return {
        affectsConfiguration: (section) => section == changingConfig
    };
}
exports.GetConfigChangeEvent = GetConfigChangeEvent;
//# sourceMappingURL=GetConfigChangeEvent.js.map