"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedEnvironmentFile = void 0;
const fs = require("fs-extra");
class ParsedEnvironmentFile {
    constructor(env, warning) {
        this.Env = env;
        this.Warning = warning;
    }
    static CreateFromFile(envFile, initialEnv) {
        let content = fs.readFileSync(envFile, "utf8");
        return this.CreateFromContent(content, envFile, initialEnv);
    }
    static CreateFromContent(content, envFile, initialEnv) {
        // Remove UTF-8 BOM if present
        if (content.charAt(0) === '\uFEFF') {
            content = content.substr(1);
        }
        let parseErrors = [];
        let env = initialEnv;
        if (!env) {
            env = {};
        }
        content.split("\n").forEach(line => {
            // Split the line between key and value
            const r = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            if (r !== null) {
                const key = r[1];
                let value = r[2] || "";
                if ((value.length > 0) && (value.charAt(0) === '"') && (value.charAt(value.length - 1) === '"')) {
                    value = value.replace(/\\n/gm, "\n");
                }
                value = value.replace(/(^['"]|['"]$)/g, "");
                env[key] = value;
            }
            else {
                // Blank lines and lines starting with # are no parse errors
                const comments = new RegExp(/^\s*(#|$)/);
                if (!comments.test(line)) {
                    parseErrors.push(line);
                }
            }
        });
        // show error message if single lines cannot get parsed
        let warning = null;
        if (parseErrors.length !== 0) {
            warning = "Ignoring non-parseable lines in envFile " + envFile + ": ";
            parseErrors.forEach(function (value, idx, array) {
                warning += "\"" + value + "\"" + ((idx !== array.length - 1) ? ", " : ".");
            });
        }
        return new ParsedEnvironmentFile(env, warning);
    }
}
exports.ParsedEnvironmentFile = ParsedEnvironmentFile;
//# sourceMappingURL=ParsedEnvironmentFile.js.map