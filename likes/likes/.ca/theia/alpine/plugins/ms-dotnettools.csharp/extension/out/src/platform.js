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
exports.PlatformInformation = exports.LinuxDistribution = void 0;
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const util = require("./common");
const unknown = 'unknown';
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
class LinuxDistribution {
    constructor(name, version, idLike) {
        this.name = name;
        this.version = version;
        this.idLike = idLike;
    }
    static GetCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
            // at https://www.freedesktop.org/software/systemd/man/os-release.html.
            return LinuxDistribution.FromFilePath('/etc/os-release')
                .catch(() => __awaiter(this, void 0, void 0, function* () { return LinuxDistribution.FromFilePath('/usr/lib/os-release'); }))
                .catch(() => __awaiter(this, void 0, void 0, function* () { return Promise.resolve(new LinuxDistribution(unknown, unknown)); }));
        });
    }
    toString() {
        return `name=${this.name}, version=${this.version}`;
    }
    /**
     * Returns a string representation of LinuxDistribution that only returns the
     * distro name if it appears on an allowed list of known distros. Otherwise,
     * it returns 'other'.
     */
    toTelemetryString() {
        const allowedList = [
            'antergos', 'arch', 'centos', 'debian', 'deepin', 'elementary', 'fedora',
            'galliumos', 'gentoo', 'kali', 'linuxmint', 'manjoro', 'neon', 'opensuse',
            'parrot', 'rhel', 'ubuntu', 'zorin'
        ];
        if (this.name === unknown || allowedList.indexOf(this.name) >= 0) {
            return this.toString();
        }
        else {
            // Having a hash of the name will be helpful to identify spikes in the 'other'
            // bucket when a new distro becomes popular and needs to be added to the
            // allowed list above.
            const hash = crypto.createHash('sha256');
            hash.update(this.name);
            const hashedName = hash.digest('hex');
            return `other (${hashedName})`;
        }
    }
    static FromFilePath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf8', (error, data) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(LinuxDistribution.FromReleaseInfo(data));
                    }
                });
            });
        });
    }
    static FromReleaseInfo(releaseInfo, eol = os.EOL) {
        let name = unknown;
        let version = unknown;
        let idLike = null;
        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();
            let equalsIndex = line.indexOf('=');
            if (equalsIndex >= 0) {
                let key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);
                // Strip double quotes if necessary
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                if (key === 'ID') {
                    name = value;
                }
                else if (key === 'VERSION_ID') {
                    version = value;
                }
                else if (key === 'ID_LIKE') {
                    idLike = value.split(" ");
                }
                if (name !== unknown && version !== unknown && idLike !== null) {
                    break;
                }
            }
        }
        return new LinuxDistribution(name, version, idLike);
    }
}
exports.LinuxDistribution = LinuxDistribution;
class PlatformInformation {
    constructor(platform, architecture, distribution = null) {
        this.platform = platform;
        this.architecture = architecture;
        this.distribution = distribution;
    }
    isWindows() {
        return this.platform === 'win32';
    }
    isMacOS() {
        return this.platform === 'darwin';
    }
    isLinux() {
        return this.platform === 'linux';
    }
    toString() {
        let result = this.platform;
        if (this.architecture) {
            if (result) {
                result += ', ';
            }
            result += this.architecture;
        }
        if (this.distribution) {
            if (result) {
                result += ', ';
            }
            result += this.distribution.toString();
        }
        return result;
    }
    static GetCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = os.platform();
            let architecturePromise;
            let distributionPromise;
            switch (platform) {
                case 'win32':
                    architecturePromise = PlatformInformation.GetWindowsArchitecture();
                    distributionPromise = Promise.resolve(null);
                    break;
                case 'darwin':
                    architecturePromise = PlatformInformation.GetUnixArchitecture();
                    distributionPromise = Promise.resolve(null);
                    break;
                case 'linux':
                    architecturePromise = PlatformInformation.GetUnixArchitecture();
                    distributionPromise = LinuxDistribution.GetCurrent();
                    break;
                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }
            const platformData = yield Promise.all([architecturePromise, distributionPromise]);
            return new PlatformInformation(platform, platformData[0], platformData[1]);
        });
    }
    static GetWindowsArchitecture() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                    resolve('x86');
                }
                else if (process.env.PROCESSOR_ARCHITECTURE === 'ARM64' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                    resolve('arm64');
                }
                else {
                    resolve('x86_64');
                }
            });
        });
    }
    static GetUnixArchitecture() {
        return __awaiter(this, void 0, void 0, function* () {
            return util.execChildProcess('uname -m')
                .then(architecture => {
                if (architecture) {
                    return architecture.trim();
                }
                return null;
            });
        });
    }
    isValidPlatformForMono() {
        return this.isLinux() || this.isMacOS();
    }
}
exports.PlatformInformation = PlatformInformation;
//# sourceMappingURL=platform.js.map