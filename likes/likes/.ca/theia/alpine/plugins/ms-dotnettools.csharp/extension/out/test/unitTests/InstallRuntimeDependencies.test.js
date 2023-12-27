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
const InstallRuntimeDependencies_1 = require("../../src/InstallRuntimeDependencies");
const EventStream_1 = require("../../src/EventStream");
const platform_1 = require("../../src/platform");
const chai = require("chai");
const TestEventBus_1 = require("./testAssets/TestEventBus");
const AbsolutePathPackage_1 = require("../../src/packageManager/AbsolutePathPackage");
const expect = chai.expect;
suite(`${InstallRuntimeDependencies_1.installRuntimeDependencies.name}`, () => {
    let packageJSON = {
        runtimeDependencies: {}
    };
    let extensionPath = "/ExtensionPath";
    let installDependencies;
    let eventStream;
    let eventBus;
    let platformInfo = new platform_1.PlatformInformation("platform1", "architecture1");
    setup(() => {
        eventStream = new EventStream_1.EventStream();
        eventBus = new TestEventBus_1.default(eventStream);
        installDependencies = () => __awaiter(void 0, void 0, void 0, function* () { return Promise.resolve(true); });
    });
    suite("When all the dependencies already exist", () => {
        suiteSetup(() => {
            packageJSON = {
                runtimeDependencies: {}
            };
        });
        test("True is returned", () => __awaiter(void 0, void 0, void 0, function* () {
            let installed = yield InstallRuntimeDependencies_1.installRuntimeDependencies(packageJSON, extensionPath, installDependencies, eventStream, platformInfo);
            expect(installed).to.be.true;
        }));
        test("Doesn't log anything to the eventStream", () => __awaiter(void 0, void 0, void 0, function* () {
            let packageJSON = {
                runtimeDependencies: {}
            };
            yield InstallRuntimeDependencies_1.installRuntimeDependencies(packageJSON, extensionPath, installDependencies, eventStream, platformInfo);
            expect(eventBus.getEvents()).to.be.empty;
        }));
    });
    suite("When there is a dependency to install", () => {
        let packageToInstall = {
            id: "myPackage",
            description: "somePackage",
            installPath: "installPath",
            binaries: [],
            url: "myUrl",
            platforms: [platformInfo.platform],
            architectures: [platformInfo.architecture]
        };
        setup(() => {
            packageJSON = {
                runtimeDependencies: [packageToInstall]
            };
        });
        test("Calls installDependencies with the absolute path package and returns true after successful installation", () => __awaiter(void 0, void 0, void 0, function* () {
            let inputPackage;
            installDependencies = (packages) => __awaiter(void 0, void 0, void 0, function* () {
                inputPackage = packages;
                return Promise.resolve(true);
            });
            let installed = yield InstallRuntimeDependencies_1.installRuntimeDependencies(packageJSON, extensionPath, installDependencies, eventStream, platformInfo);
            expect(installed).to.be.true;
            expect(inputPackage).to.have.length(1);
            expect(inputPackage[0]).to.be.deep.equal(AbsolutePathPackage_1.AbsolutePathPackage.getAbsolutePathPackage(packageToInstall, extensionPath));
        }));
        test("Returns false when installDependencies returns false", () => __awaiter(void 0, void 0, void 0, function* () {
            installDependencies = () => __awaiter(void 0, void 0, void 0, function* () { return Promise.resolve(false); });
            let installed = yield InstallRuntimeDependencies_1.installRuntimeDependencies(packageJSON, extensionPath, installDependencies, eventStream, platformInfo);
            expect(installed).to.be.false;
        }));
    });
});
//# sourceMappingURL=InstallRuntimeDependencies.test.js.map