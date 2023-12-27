"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatusBarObserver = void 0;
const path_1 = require("path");
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
const EventType_1 = require("../omnisharp/EventType");
class ProjectStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpOnMultipleLaunchTargets:
                    this.SetAndShowStatusBar('$(file-submodule) Select project', 'o.pickProjectAndStart', 'rgb(90, 218, 90)');
                    break;
                case EventType_1.EventType.OmnisharpServerOnStop:
                    this.ResetAndHideStatusBar();
                    break;
                case EventType_1.EventType.WorkspaceInformationUpdated:
                    this.handleWorkspaceInformationUpdated(event);
            }
        };
    }
    handleWorkspaceInformationUpdated(event) {
        let label;
        let info = event.info;
        if (info.MsBuild && info.MsBuild.SolutionPath) {
            label = path_1.basename(info.MsBuild.SolutionPath); //workspace.getRelativePath(info.MsBuild.SolutionPath);
            this.SetAndShowStatusBar('$(file-directory) ' + label, 'o.pickProjectAndStart');
        }
        else {
            this.ResetAndHideStatusBar();
        }
    }
}
exports.ProjectStatusBarObserver = ProjectStatusBarObserver;
//# sourceMappingURL=ProjectStatusBarObserver.js.map