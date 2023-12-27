"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../src/coreclr-debug/util");
const platform_1 = require("../../../src/platform");
const chai_1 = require("chai");
const getDotnetInfo_1 = require("../../../src/utils/getDotnetInfo");
suite("getTargetArchitecture Tests", () => {
    suiteSetup(() => chai_1.should());
    suite("Error", () => {
        test("Invalid Call", () => {
            let fn = function () { util_1.getTargetArchitecture(null, null, null); };
            chai_1.expect(fn).to.throw("Unable to retrieve 'TargetArchitecture' without platformInfo.");
        });
    });
    suite("Windows", () => {
        test("Windows x86_64", () => {
            const platformInfo = new platform_1.PlatformInformation("windows", "x86_64", null);
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, null);
            chai_1.assert.equal(targetArchitecture, "");
        });
    });
    suite("Linux", () => {
        test("getTargetArchitecture on Linux", () => {
            const platformInfo = new platform_1.PlatformInformation("linux", "x86_64", null);
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, null);
            chai_1.assert.equal(targetArchitecture, "");
        });
    });
    suite("macOS", () => {
        test("Apple x86_64", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "x86_64", null);
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, null);
            chai_1.assert.equal(targetArchitecture, "x86_64");
        });
        test("Apple ARM64 on .NET 5", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "5.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-x64";
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, dotnetInfo);
            chai_1.assert.equal(targetArchitecture, "x86_64");
        });
        test("Apple ARM64 on .NET 6 osx-arm64", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-arm64";
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, dotnetInfo);
            chai_1.assert.equal(targetArchitecture, "arm64");
        });
        test("Apple ARM64 on .NET 6 osx-x64", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-x64";
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, null, dotnetInfo);
            chai_1.assert.equal(targetArchitecture, "x86_64");
        });
        test("Apple ARM64 on .NET 6 osx-arm64 with targetArchitecture: 'arm64'", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-arm64";
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, "arm64", dotnetInfo);
            chai_1.assert.equal(targetArchitecture, "arm64");
        });
        test("Apple ARM64 on .NET 6 osx-arm64 with targetArchitecture: 'x86_64'", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-x86_64";
            const targetArchitecture = util_1.getTargetArchitecture(platformInfo, "x86_64", dotnetInfo);
            chai_1.assert.equal(targetArchitecture, "x86_64");
        });
        test("Apple ARM64 on .NET 6 osx-arm64 with invalid targetArchitecture", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-x86_64";
            let fn = function () { util_1.getTargetArchitecture(platformInfo, "x64", dotnetInfo); };
            chai_1.expect(fn).to.throw("The value 'x64' for 'targetArchitecture' in launch configuraiton is invalid. Expected 'x86_64' or 'arm64'.");
        });
        test("Apple ARM64 on .NET 6 osx-arm64 with invalid RuntimeId", () => {
            const platformInfo = new platform_1.PlatformInformation("darwin", "arm64", null);
            const dotnetInfo = new getDotnetInfo_1.DotnetInfo();
            dotnetInfo.Version = "6.0.0";
            dotnetInfo.RuntimeId = "osx.11.0-FUTURE_ISA";
            let fn = function () { util_1.getTargetArchitecture(platformInfo, null, dotnetInfo); };
            chai_1.expect(fn).to.throw(`Unexpected RuntimeId 'osx.11.0-FUTURE_ISA'.`);
        });
    });
});
//# sourceMappingURL=targetArchitecture.test.js.map