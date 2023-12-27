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
exports.OmnisharpChannelObserver = void 0;
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const EventType_1 = require("../omnisharp/EventType");
class OmnisharpChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor(channel, vscode) {
        super(channel);
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.ShowOmniSharpChannel:
                case EventType_1.EventType.OmnisharpFailure:
                    this.showChannel(true);
                    break;
                case EventType_1.EventType.OmnisharpServerOnStdErr:
                    this.handleOmnisharpServerOnStdErr(event);
                    break;
                case EventType_1.EventType.OmnisharpRestart:
                    this.clearChannel();
                    break;
            }
        };
    }
    handleOmnisharpServerOnStdErr(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let csharpConfig = this.vscode.workspace.getConfiguration('csharp');
            if (csharpConfig.get('showOmnisharpLogOnError')) {
                this.showChannel(true);
            }
        });
    }
}
exports.OmnisharpChannelObserver = OmnisharpChannelObserver;
//# sourceMappingURL=OmnisharpChannelObserver.js.map