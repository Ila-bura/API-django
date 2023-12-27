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
exports.WarningMessageObserver = void 0;
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const ShowWarningMessage_1 = require("./utils/ShowWarningMessage");
const EventType_1 = require("../omnisharp/EventType");
class WarningMessageObserver {
    constructor(vscode, disableMsBuildDiagnosticWarning, scheduler) {
        this.vscode = vscode;
        this.disableMsBuildDiagnosticWarning = disableMsBuildDiagnosticWarning;
        this.post = (event) => {
            switch (event.type) {
                case EventType_1.EventType.OmnisharpServerOnError:
                    this.warningMessageDebouncer.next(event);
                    break;
                case EventType_1.EventType.OmnisharpServerMsBuildProjectDiagnostics:
                    this.handleOmnisharpServerMsBuildProjectDiagnostics(event);
                    break;
            }
        };
        this.warningMessageDebouncer = new rxjs_1.Subject();
        this.warningMessageDebouncer.pipe(operators_1.debounceTime(1500, scheduler)).subscribe((event) => __awaiter(this, void 0, void 0, function* () {
            let message = "Some projects have trouble loading. Please review the output for more details.";
            yield ShowWarningMessage_1.default(this.vscode, message, { title: "Show Output", command: 'o.showOutput' });
        }));
    }
    handleOmnisharpServerMsBuildProjectDiagnostics(event) {
        if (!this.disableMsBuildDiagnosticWarning() && event.diagnostics.Errors.length > 0) {
            this.warningMessageDebouncer.next(event);
        }
    }
}
exports.WarningMessageObserver = WarningMessageObserver;
//# sourceMappingURL=WarningMessageObserver.js.map