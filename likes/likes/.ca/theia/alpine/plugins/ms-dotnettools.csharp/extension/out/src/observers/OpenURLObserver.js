"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenURLObserver = void 0;
const EventType_1 = require("../omnisharp/EventType");
class OpenURLObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OpenURL:
                    let url = event.url;
                    this.vscode.env.openExternal(this.vscode.Uri.parse(url));
                    break;
            }
        };
    }
}
exports.OpenURLObserver = OpenURLObserver;
//# sourceMappingURL=OpenURLObserver.js.map