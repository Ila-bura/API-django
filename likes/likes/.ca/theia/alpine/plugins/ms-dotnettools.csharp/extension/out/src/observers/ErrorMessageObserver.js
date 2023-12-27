"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessageObserver = void 0;
const ShowErrorMessage_1 = require("./utils/ShowErrorMessage");
const EventType_1 = require("../omnisharp/EventType");
class ErrorMessageObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.ZipError:
                    this.handleZipError(event);
                    break;
                case EventType_1.EventType.DotNetTestRunFailure:
                    this.handleDotnetTestRunFailure(event);
                    break;
                case EventType_1.EventType.DotNetTestDebugStartFailure:
                    this.handleDotNetTestDebugStartFailure(event);
                    break;
                case EventType_1.EventType.IntegrityCheckFailure:
                    this.handleIntegrityCheckFailure(event);
            }
        };
    }
    handleIntegrityCheckFailure(event) {
        if (!event.retry) {
            ShowErrorMessage_1.default(this.vscode, `Package ${event.packageDescription} download from ${event.url} failed integrity check. Some features may not work as expected. Please restart Visual Studio Code to retrigger the download`);
        }
    }
    handleZipError(event) {
        ShowErrorMessage_1.default(this.vscode, event.message);
    }
    handleDotnetTestRunFailure(event) {
        ShowErrorMessage_1.default(this.vscode, `Failed to run test because ${event.message}.`);
    }
    handleDotNetTestDebugStartFailure(event) {
        ShowErrorMessage_1.default(this.vscode, `Failed to start debugger: ${event.message}`);
    }
}
exports.ErrorMessageObserver = ErrorMessageObserver;
//# sourceMappingURL=ErrorMessageObserver.js.map