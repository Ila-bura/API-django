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
const fs = require("async-file");
const getPort = require('get-port');
const ServerMock = require("mock-http-server");
class MockHttpsServer {
    constructor(server, baseUrl) {
        this.server = server;
        this.baseUrl = baseUrl;
    }
    addRequestHandler(method, path, reply_status, reply_headers, reply_body) {
        this.server.on({
            method,
            path,
            reply: {
                status: reply_status,
                headers: reply_headers,
                body: reply_body
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => this.server.start(resolve));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.server.stop(resolve));
        });
    }
    static CreateMockHttpsServer() {
        return __awaiter(this, void 0, void 0, function* () {
            let port = yield getPort();
            let server = new ServerMock(null, {
                host: "localhost",
                port: port,
                key: yield fs.readFile("test/unitTests/testAssets/private.pem"),
                cert: yield fs.readFile("test/unitTests/testAssets/public.pem")
            });
            return new MockHttpsServer(server, `https://localhost:${port}`);
        });
    }
}
exports.default = MockHttpsServer;
//# sourceMappingURL=MockHttpsServer.js.map