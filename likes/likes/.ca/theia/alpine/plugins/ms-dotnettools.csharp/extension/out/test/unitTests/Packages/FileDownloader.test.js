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
const chai = require("chai");
const EventStream_1 = require("../../../src/EventStream");
const FileDownloader_1 = require("../../../src/packageManager/FileDownloader");
const NetworkSettings_1 = require("../../../src/NetworkSettings");
const loggingEvents_1 = require("../../../src/omnisharp/loggingEvents");
const MockHttpsServer_1 = require("../testAssets/MockHttpsServer");
const TestEventBus_1 = require("../testAssets/TestEventBus");
chai.use(require("chai-as-promised"));
chai.use(require('chai-arrays'));
const expect = chai.expect;
suite("FileDownloader", () => {
    const fileDescription = "Test file";
    const correctUrlPath = `/resource`;
    const redirectUrlPath = '/redirectResource';
    const errorUrlPath = '/errorResource';
    const networkSettingsProvider = () => new NetworkSettings_1.default(undefined, false);
    const eventStream = new EventStream_1.EventStream();
    let eventBus;
    const getPrimaryURLEvents = () => {
        return [
            new loggingEvents_1.DownloadStart(fileDescription),
            new loggingEvents_1.DownloadSizeObtained(12),
            new loggingEvents_1.DownloadProgress(100, fileDescription),
            new loggingEvents_1.DownloadSuccess(' Done!')
        ];
    };
    const getFallBackURLEvents = () => {
        return [
            new loggingEvents_1.DownloadStart(fileDescription),
            new loggingEvents_1.DownloadFailure(`Failed to download from ${server.baseUrl}${errorUrlPath}. Error code '404')`),
            new loggingEvents_1.DownloadFallBack(`${server.baseUrl}${correctUrlPath}`),
            new loggingEvents_1.DownloadSizeObtained(12),
            new loggingEvents_1.DownloadProgress(100, fileDescription),
            new loggingEvents_1.DownloadSuccess(' Done!')
        ];
    };
    let server;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        server = yield MockHttpsServer_1.default.CreateMockHttpsServer();
        yield server.start();
        eventBus = new TestEventBus_1.default(eventStream);
        server.addRequestHandler('GET', correctUrlPath, 200, { "content-type": "text/plain" }, "Test content");
        server.addRequestHandler('GET', errorUrlPath, 404);
        server.addRequestHandler('GET', redirectUrlPath, 301, { "location": `${server.baseUrl}${correctUrlPath}` });
    }));
    suite('If the response status Code is 200, the download succeeds', () => {
        [
            {
                description: "Primary url",
                urlPath: correctUrlPath,
                fallBackUrlPath: "",
                getEventSequence: getPrimaryURLEvents
            },
            {
                description: "Fallback url",
                urlPath: errorUrlPath,
                fallBackUrlPath: correctUrlPath,
                getEventSequence: getFallBackURLEvents
            }
        ].forEach((elem) => {
            suite(elem.description, () => {
                test('File is downloaded', () => __awaiter(void 0, void 0, void 0, function* () {
                    let buffer = yield FileDownloader_1.DownloadFile(fileDescription, eventStream, networkSettingsProvider, getURL(elem.urlPath), getURL(elem.fallBackUrlPath));
                    let text = buffer.toString('utf8');
                    expect(text).to.be.equal("Test content");
                }));
                test('Events are created in the correct order', () => __awaiter(void 0, void 0, void 0, function* () {
                    yield FileDownloader_1.DownloadFile(fileDescription, eventStream, networkSettingsProvider, getURL(elem.urlPath), getURL(elem.fallBackUrlPath));
                    expect(eventBus.getEvents()).to.be.deep.equal(elem.getEventSequence());
                }));
            });
        });
    });
    suite('If the response status Code is 301, redirect occurs and the download succeeds', () => {
        test('File is downloaded from the redirect url', () => __awaiter(void 0, void 0, void 0, function* () {
            let buffer = yield FileDownloader_1.DownloadFile(fileDescription, eventStream, networkSettingsProvider, getURL(redirectUrlPath));
            let text = buffer.toString('utf8');
            expect(text).to.be.equal("Test content");
        }));
    });
    suite('If the response status code is not 301, 302 or 200 then the download fails', () => {
        test('Error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
            const downloadPromise = FileDownloader_1.DownloadFile(fileDescription, eventStream, networkSettingsProvider, getURL(errorUrlPath));
            try {
                yield downloadPromise;
            }
            catch (_a) { }
            expect(downloadPromise).be.rejected;
        }));
        test('Download Start and Download Failure events are created', () => __awaiter(void 0, void 0, void 0, function* () {
            let eventsSequence = [
                new loggingEvents_1.DownloadStart(fileDescription),
                new loggingEvents_1.DownloadFailure(`Failed to download from ${server.baseUrl}${errorUrlPath}. Error code '404')`)
            ];
            try {
                yield FileDownloader_1.DownloadFile(fileDescription, eventStream, networkSettingsProvider, getURL(errorUrlPath));
            }
            catch (error) {
                expect(eventBus.getEvents()).to.be.deep.equal(eventsSequence);
            }
        }));
    });
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield server.stop();
        eventBus.dispose();
    }));
    function getURL(urlPath) {
        return `${server.baseUrl}${urlPath}`;
    }
});
//# sourceMappingURL=FileDownloader.test.js.map