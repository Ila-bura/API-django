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
const CSharpExtensionId_1 = require("../constants/CSharpExtensionId");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const issuesUrl = "https://github.com/OmniSharp/omnisharp-vscode/issues/new";
function reportIssue(vscode, eventStream, getDotnetInfo, isValidPlatformForMono, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        const dotnetInfo = yield getDotnetInfo();
        const monoInfo = yield getMonoIfPlatformValid(isValidPlatformForMono, options, monoResolver);
        let extensions = getInstalledExtensions(vscode);
        let csharpExtVersion = getCsharpExtensionVersion(vscode);
        const body = `## Issue Description ##
## Steps to Reproduce ##

## Expected Behavior ##

## Actual Behavior ##

## Logs ##

### OmniSharp log ###
<details>Post the output from Output-->OmniSharp log here</details>

### C# log ###
<details>Post the output from Output-->C# here</details>

## Environment information ##

**VSCode version**: ${vscode.version}
**C# Extension**: ${csharpExtVersion}

${monoInfo}
<details><summary>Dotnet Information</summary>
${dotnetInfo.FullInfo}</details>
<details><summary>Visual Studio Code Extensions</summary>
${generateExtensionTable(extensions)}
</details>
`;
        const queryStringPrefix = "?";
        const issueDefault = "Please paste the output from your clipboard";
        const fullUrl = `${issuesUrl}${queryStringPrefix}body=${issueDefault}`;
        yield vscode.env.clipboard.writeText(body);
        eventStream.post(new loggingEvents_1.OpenURL(fullUrl));
    });
}
exports.default = reportIssue;
function sortExtensions(a, b) {
    if (a.packageJSON.name.toLowerCase() < b.packageJSON.name.toLowerCase()) {
        return -1;
    }
    if (a.packageJSON.name.toLowerCase() > b.packageJSON.name.toLowerCase()) {
        return 1;
    }
    return 0;
}
function generateExtensionTable(extensions) {
    if (extensions.length <= 0) {
        return "none";
    }
    const tableHeader = `|Extension|Author|Version|\n|---|---|---|`;
    const table = extensions.map((e) => `|${e.packageJSON.name}|${e.packageJSON.publisher}|${e.packageJSON.version}|`).join("\n");
    const extensionTable = `
${tableHeader}\n${table};
`;
    return extensionTable;
}
function getMonoIfPlatformValid(isValidPlatformForMono, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isValidPlatformForMono) {
            let monoVersion;
            try {
                let globalMonoInfo = yield monoResolver.getGlobalMonoInfo(options);
                if (globalMonoInfo) {
                    monoVersion = `OmniSharp using global mono :${globalMonoInfo.version}`;
                }
                else {
                    monoVersion = `OmniSharp using built-in mono`;
                }
            }
            catch (error) {
                monoVersion = `There is a problem with running OmniSharp on mono: ${error}`;
            }
            return `<details><summary>Mono Information</summary>
        ${monoVersion}</details>`;
        }
        return "";
    });
}
function getInstalledExtensions(vscode) {
    let extensions = vscode.extensions.all
        .filter(extension => extension.packageJSON.isBuiltin === false);
    return extensions.sort(sortExtensions);
}
function getCsharpExtensionVersion(vscode) {
    const extension = vscode.extensions.getExtension(CSharpExtensionId_1.CSharpExtensionId);
    return extension.packageJSON.version;
}
//# sourceMappingURL=reportIssue.js.map