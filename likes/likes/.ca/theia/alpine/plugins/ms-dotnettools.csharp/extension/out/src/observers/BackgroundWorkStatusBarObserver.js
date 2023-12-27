"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundWorkStatusBarObserver = void 0;
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
const EventType_1 = require("../omnisharp/EventType");
const protocol_1 = require("../omnisharp/protocol");
class BackgroundWorkStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            if (event.type === EventType_1.EventType.ProjectDiagnosticStatus) {
                let asProjectEvent = event;
                if (asProjectEvent.message.Status === protocol_1.DiagnosticStatus.Processing) {
                    let projectFile = asProjectEvent.message.ProjectFilePath.replace(/^.*[\\\/]/, '');
                    this.SetAndShowStatusBar(`$(sync~spin) Analyzing ${projectFile}`, 'o.showOutput', null, `Analyzing ${projectFile}`);
                }
                else {
                    this.ResetAndHideStatusBar();
                }
            }
        };
    }
}
exports.BackgroundWorkStatusBarObserver = BackgroundWorkStatusBarObserver;
//# sourceMappingURL=BackgroundWorkStatusBarObserver.js.map