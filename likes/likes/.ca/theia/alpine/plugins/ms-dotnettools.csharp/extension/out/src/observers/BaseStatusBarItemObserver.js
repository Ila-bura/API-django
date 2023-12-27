"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStatusBarItemObserver = void 0;
class BaseStatusBarItemObserver {
    constructor(statusBarItem) {
        this.statusBarItem = statusBarItem;
    }
    SetAndShowStatusBar(text, command, color, tooltip) {
        this.statusBarItem.text = text;
        this.statusBarItem.command = command;
        this.statusBarItem.color = color;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }
    ResetAndHideStatusBar() {
        this.statusBarItem.text = undefined;
        this.statusBarItem.command = undefined;
        this.statusBarItem.color = undefined;
        this.statusBarItem.tooltip = undefined;
        this.statusBarItem.hide();
    }
}
exports.BaseStatusBarItemObserver = BaseStatusBarItemObserver;
//# sourceMappingURL=BaseStatusBarItemObserver.js.map