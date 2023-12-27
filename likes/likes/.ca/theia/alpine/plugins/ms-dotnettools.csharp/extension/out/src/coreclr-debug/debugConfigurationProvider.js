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
exports.DotnetDebugConfigurationProvider = void 0;
const processPicker_1 = require("../features/processPicker");
class DotnetDebugConfigurationProvider {
    constructor(platformInformation) {
        this.platformInformation = platformInformation;
    }
    resolveDebugConfigurationWithSubstitutedVariables(folder, debugConfiguration, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!debugConfiguration) {
                return null;
            }
            // Process Id is empty, handle Attach to Process Dialog.
            if (debugConfiguration.request === "attach" && !debugConfiguration.processId && !debugConfiguration.processName) {
                let process = undefined;
                if (debugConfiguration.pipeTransport) {
                    process = yield processPicker_1.RemoteAttachPicker.ShowAttachEntries(debugConfiguration, this.platformInformation);
                }
                else {
                    let attachItemsProvider = processPicker_1.DotNetAttachItemsProviderFactory.Get();
                    let attacher = new processPicker_1.AttachPicker(attachItemsProvider);
                    process = yield attacher.ShowAttachEntries();
                }
                if (process) {
                    debugConfiguration.processId = process.id;
                    if (debugConfiguration.type == "coreclr" &&
                        this.platformInformation.isMacOS() &&
                        this.platformInformation.architecture == 'arm64') {
                        // For Apple Silicon M1, it is possible that the process we are attaching to is being emulated as x86_64. 
                        // The process is emulated if it has process flags has P_TRANSLATED (0x20000).
                        if (process.flags & 0x20000) {
                            debugConfiguration.targetArchitecture = "x86_64";
                        }
                        else {
                            debugConfiguration.targetArchitecture = "arm64";
                        }
                    }
                }
                else {
                    throw new Error("No process was selected.");
                }
            }
            return debugConfiguration;
        });
    }
}
exports.DotnetDebugConfigurationProvider = DotnetDebugConfigurationProvider;
//# sourceMappingURL=debugConfigurationProvider.js.map