"use strict";
/*---------------------------------------------------------------------------------------------
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
exports.InstallTarGz = void 0;
const tar = require("tar");
const stream_1 = require("stream");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const NestedError_1 = require("../NestedError");
function InstallTarGz(buffer, description, destinationInstallPath, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        eventStream.post(new loggingEvents_1.InstallationStart(description));
        return new Promise((resolve, reject) => {
            const reader = new stream_1.Readable();
            reader.push(buffer);
            reader.push(null);
            reader.pipe(tar.extract({
                cwd: destinationInstallPath.value
            }))
                .on('error', err => {
                let message = "C# Extension was unable to install its dependencies. Please check your internet connection. If you use a proxy server, please visit https://aka.ms/VsCodeCsharpNetworking";
                eventStream.post(new loggingEvents_1.ZipError(message));
                return reject(new NestedError_1.NestedError(message));
            })
                .on('end', () => resolve());
        });
    });
}
exports.InstallTarGz = InstallTarGz;
//# sourceMappingURL=TarGzInstaller.js.map