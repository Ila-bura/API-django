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
const OmniSharpMonoResolver_1 = require("../../../src/omnisharp/OmniSharpMonoResolver");
const chai_1 = require("chai");
const path_1 = require("path");
const FakeOptions_1 = require("../Fakes/FakeOptions");
chai_1.use(require('chai-as-promised'));
suite(`${OmniSharpMonoResolver_1.OmniSharpMonoResolver.name}`, () => {
    let getMonoCalled;
    let environment;
    let options;
    const monoPath = "monoPath";
    const lowerMonoVersion = "6.2.0";
    const requiredMonoVersion = "6.4.0";
    const higherMonoVersion = "6.6.0";
    // Sets the meaning of UseGlobalMono "auto". When false, "auto" means "never".
    const autoMeansAlways = false;
    const getMono = (version) => (env) => __awaiter(void 0, void 0, void 0, function* () {
        getMonoCalled = true;
        environment = env;
        return Promise.resolve(version);
    });
    setup(() => {
        getMonoCalled = false;
        options = FakeOptions_1.getEmptyOptions();
    });
    test(`it returns undefined if the version is less than ${requiredMonoVersion} and useGlobalMono is auto`, () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(lowerMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "auto", monoPath: monoPath }));
        chai_1.expect(monoInfo).to.be.undefined;
    }));
    test("it returns undefined if useGlobalMono is never", () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(higherMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "never", monoPath: monoPath }));
        chai_1.expect(monoInfo).to.be.undefined;
    }));
    test(`it returns the path and version if the version is greater than or equal to ${requiredMonoVersion} and useGlobalMono is always`, () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(requiredMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "always", monoPath: monoPath }));
        chai_1.expect(monoInfo.version).to.be.equal(requiredMonoVersion);
        chai_1.expect(monoInfo.path).to.be.equal(monoPath);
    }));
    test(`it returns the path and version if the version is greater than or equal to ${requiredMonoVersion} and useGlobalMono is auto`, () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(higherMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "auto", monoPath: monoPath }));
        if (!autoMeansAlways) {
            chai_1.expect(monoInfo).to.be.undefined;
        }
        else {
            chai_1.expect(monoInfo.version).to.be.equal(higherMonoVersion);
            chai_1.expect(monoInfo.path).to.be.equal(monoPath);
        }
    }));
    test(`it throws exception if getGlobalMonoInfo is always and version<${requiredMonoVersion}`, () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(lowerMonoVersion));
        yield chai_1.expect(monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "always", monoPath: monoPath }))).to.be.rejected;
    }));
    test("sets the environment with the monoPath id useGlobalMono is auto", () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(requiredMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "auto", monoPath: monoPath }));
        if (!autoMeansAlways) {
            chai_1.expect(monoInfo).to.be.undefined;
        }
        else {
            chai_1.expect(monoInfo.env["PATH"]).to.contain(path_1.join(monoPath, 'bin'));
            chai_1.expect(monoInfo.env["MONO_GAC_PREFIX"]).to.be.equal(monoPath);
        }
    }));
    test("sets the environment with the monoPath id useGlobalMono is auto", () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(requiredMonoVersion));
        let monoInfo = yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "auto", monoPath: monoPath }));
        if (!autoMeansAlways) {
            chai_1.expect(monoInfo).to.be.undefined;
        }
        else {
            chai_1.expect(monoInfo.env["PATH"]).to.contain(path_1.join(monoPath, 'bin'));
            chai_1.expect(monoInfo.env["MONO_GAC_PREFIX"]).to.be.equal(monoPath);
        }
    }));
    test("doesn't set the environment with the monoPath if useGlobalMono is never", () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(requiredMonoVersion));
        yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "never", monoPath: monoPath }));
        chai_1.expect(getMonoCalled).to.be.equal(true);
        chai_1.expect(environment["PATH"] || "").to.not.contain(path_1.join(monoPath, 'bin'));
        chai_1.expect(environment["MONO_GAC_PREFIX"]).to.be.undefined;
    }));
    test("getMono is called with the environment that includes the monoPath if the useGlobalMono is auto or always", () => __awaiter(void 0, void 0, void 0, function* () {
        let monoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMono(requiredMonoVersion));
        yield monoResolver.getGlobalMonoInfo(Object.assign(Object.assign({}, options), { useGlobalMono: "auto", monoPath: monoPath }));
        chai_1.expect(getMonoCalled).to.be.equal(true);
        chai_1.expect(environment["PATH"]).to.contain(path_1.join(monoPath, 'bin'));
        chai_1.expect(environment["MONO_GAC_PREFIX"]).to.be.equal(monoPath);
    }));
});
//# sourceMappingURL=OmniSharpMonoResolver.test.js.map