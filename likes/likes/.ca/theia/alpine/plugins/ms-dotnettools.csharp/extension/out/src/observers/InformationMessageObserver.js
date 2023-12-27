"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformationMessageObserver = void 0;
const ShowInformationMessage_1 = require("./utils/ShowInformationMessage");
const EventType_1 = require("../omnisharp/EventType");
class InformationMessageObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpServerUnresolvedDependencies:
                    this.handleOmnisharpServerUnresolvedDependencies(event);
                    break;
            }
        };
    }
    handleOmnisharpServerUnresolvedDependencies(event) {
        return __awaiter(this, void 0, void 0, function* () {
            //to do: determine if we need the unresolved dependencies message
            let csharpConfig = this.vscode.workspace.getConfiguration('csharp');
            if (!csharpConfig.get('suppressDotnetRestoreNotification')) {
                let message = `There are unresolved dependencies. Please execute the restore command to continue.`;
                return ShowInformationMessage_1.default(this.vscode, message, { title: "Restore", command: "dotnet.restore.all" });
            }
        });
    }
}
exports.InformationMessageObserver = InformationMessageObserver;
//# sourceMappingURL=InformationMessageObserver.js.map