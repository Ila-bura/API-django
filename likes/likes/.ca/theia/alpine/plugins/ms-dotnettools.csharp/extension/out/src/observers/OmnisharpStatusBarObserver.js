"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnisharpStatusBarObserver = exports.StatusBarColors = void 0;
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
const EventType_1 = require("../omnisharp/EventType");
var StatusBarColors;
(function (StatusBarColors) {
    StatusBarColors["Red"] = "rgb(218,0,0)";
    StatusBarColors["Green"] = "rgb(0,218,0)";
    StatusBarColors["Yellow"] = "rgb(218,218,0)";
})(StatusBarColors = exports.StatusBarColors || (exports.StatusBarColors = {}));
class OmnisharpStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpServerOnServerError:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Red, 'Error starting OmniSharp');
                    break;
                case EventType_1.EventType.OmnisharpServerOnStdErr:
                    let msg = event.message;
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Red, `OmniSharp process errored:${msg}`);
                    break;
                case EventType_1.EventType.OmnisharpOnBeforeServerInstall:
                    this.SetAndShowStatusBar('$(flame) Installing OmniSharp...', 'o.showOutput');
                    break;
                case EventType_1.EventType.OmnisharpOnBeforeServerStart:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Yellow, 'Starting OmniSharp server');
                    break;
                case EventType_1.EventType.OmnisharpServerOnStop:
                    this.ResetAndHideStatusBar();
                    break;
                case EventType_1.EventType.OmnisharpServerOnStart:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', undefined, 'OmniSharp server is running');
                    break;
                case EventType_1.EventType.DownloadStart:
                    this.SetAndShowStatusBar("$(cloud-download) Downloading packages", '', '', `Downloading package '${event.packageDescription}...' `);
                    break;
                case EventType_1.EventType.InstallationStart:
                    this.SetAndShowStatusBar("$(desktop-download) Installing packages...", '', '', `Installing package '${event.packageDescription}'`);
                    break;
                case EventType_1.EventType.InstallationSuccess:
                    this.ResetAndHideStatusBar();
                    break;
                case EventType_1.EventType.DownloadProgress:
                    let progressEvent = event;
                    this.SetAndShowStatusBar("$(cloud-download) Downloading packages", '', '', `Downloading package '${progressEvent.packageDescription}'... ${progressEvent.downloadPercentage}%`);
                    break;
            }
        };
    }
}
exports.OmnisharpStatusBarObserver = OmnisharpStatusBarObserver;
//# sourceMappingURL=OmnisharpStatusBarObserver.js.map