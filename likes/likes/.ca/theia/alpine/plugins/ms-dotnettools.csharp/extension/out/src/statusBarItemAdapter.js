"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarItemAdapter = void 0;
class StatusBarItemAdapter {
    constructor(statusBarItem) {
        this.statusBarItem = statusBarItem;
    }
    get alignment() {
        return this.statusBarItem.alignment;
    }
    get priority() {
        return this.statusBarItem.priority;
    }
    get text() {
        return this.statusBarItem.text;
    }
    set text(value) {
        this.statusBarItem.text = value;
    }
    get tooltip() {
        return this.statusBarItem.tooltip;
    }
    set tooltip(value) {
        this.statusBarItem.tooltip = value;
    }
    get color() {
        return this.statusBarItem.color;
    }
    set color(value) {
        this.statusBarItem.color = value;
    }
    get command() {
        return this.statusBarItem.command;
    }
    set command(value) {
        this.statusBarItem.command = value;
    }
    show() {
        this.statusBarItem.show();
    }
    hide() {
        this.statusBarItem.hide();
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarItemAdapter = StatusBarItemAdapter;
//# sourceMappingURL=statusBarItemAdapter.js.map