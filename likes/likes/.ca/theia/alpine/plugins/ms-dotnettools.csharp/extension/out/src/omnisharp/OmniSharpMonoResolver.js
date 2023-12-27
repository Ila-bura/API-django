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
exports.OmniSharpMonoResolver = void 0;
const semver_1 = require("semver");
const path = require("path");
class OmniSharpMonoResolver {
    constructor(getMonoVersion) {
        this.getMonoVersion = getMonoVersion;
        this.minimumMonoVersion = "6.4.0";
    }
    configureEnvironmentAndGetInfo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let env = Object.assign({}, process.env);
            let monoPath;
            if (options.useGlobalMono !== "never" && options.monoPath !== undefined) {
                env['PATH'] = path.join(options.monoPath, 'bin') + path.delimiter + env['PATH'];
                env['MONO_GAC_PREFIX'] = options.monoPath;
                monoPath = options.monoPath;
            }
            let version = yield this.getMonoVersion(env);
            return {
                version,
                path: monoPath,
                env
            };
        });
    }
    getGlobalMonoInfo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let monoInfo = yield this.configureEnvironmentAndGetInfo(options);
            let isValid = monoInfo.version && semver_1.satisfies(monoInfo.version, `>=${this.minimumMonoVersion}`);
            if (options.useGlobalMono === "always") {
                let isMissing = monoInfo.version === undefined;
                if (isMissing) {
                    const suggestedAction = options.monoPath
                        ? "Update the \"omnisharp.monoPath\" setting to point to the folder containing Mono's '/bin' folder."
                        : "Ensure that Mono's '/bin' folder is added to your environment's PATH variable.";
                    throw new Error(`Unable to find Mono. ${suggestedAction}`);
                }
                if (!isValid) {
                    throw new Error(`Found Mono version ${monoInfo.version}. Cannot start OmniSharp because Mono version >=${this.minimumMonoVersion} is required.`);
                }
                return monoInfo;
            }
            else if (options.useGlobalMono === "auto" && isValid) {
                // While waiting for Mono to ship with a MSBuild version 16.8 or higher, we will treat "auto"
                // as "Use included Mono".
                // return monoInfo;
            }
            return undefined;
        });
    }
}
exports.OmniSharpMonoResolver = OmniSharpMonoResolver;
//# sourceMappingURL=OmniSharpMonoResolver.js.map