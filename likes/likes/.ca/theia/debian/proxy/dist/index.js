"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const http_proxy_1 = require("http-proxy");
const detect_port_1 = __importDefault(require("detect-port"));
const fs_1 = require("fs");
const proxy = http_proxy_1.createProxy();
proxy.on("error", (err, req, res) => {
    console.log("#1", err);
    if (res && res.end) {
        res.end();
    }
    return;
});
const proxyHost = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = /^(\d+)-.*$/.exec(req.headers.host);
    if (!result) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(fs_1.readFileSync(__dirname + "/../templates/invalid-port-format.html", "utf-8"));
        return;
    }
    const port = Number(result[1]);
    switch (true) {
        case (yield detect_port_1.default(port)) === port: {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(fs_1.readFileSync(__dirname + "/../templates/port-not-in-use.html", "utf-8").replace(/{{PORT}}/g, String(port)));
            return;
        }
        default: {
            proxy.web(req, res, {
                target: `http://localhost:${port}${req.url}`,
                ignorePath: true,
            });
        }
    }
}));
proxyHost.on("upgrade", (req, socket, head) => {
    const parsedHost = /^(\d+)-.*$/.exec(req.headers.host);
    if (parsedHost && parsedHost[1]) {
        const port = Number(parsedHost[1]);
        console.log(port);
        return proxy.ws(req, socket, head, {
            target: `http://localhost:${port}${req.url}`,
            ignorePath: true,
        });
    }
});
proxyHost.on("error", function (e) {
    console.log(e);
});
proxyHost.listen(Number(process.env.PORT) || 63901, "0.0.0.0");
//# sourceMappingURL=index.js.map