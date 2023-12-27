"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const processPicker_1 = require("../../src/features/processPicker");
const chai_1 = require("chai");
suite("Remote Process Picker: Validate quoting arguments.", () => {
    suiteSetup(() => chai_1.should());
    test("Argument with no spaces", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\nospace\\program.exe");
        nonQuotedArg.should.deep.equal("C:\\Users\\nospace\\program.exe");
    });
    test("Argument with spaces", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\s p a c e\\program.exe");
        nonQuotedArg.should.deep.equal("\"C:\\Users\\s p a c e\\program.exe\"");
    });
    test("Argument with spaces with no quotes", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\s p a c e\\program.exe", false);
        nonQuotedArg.should.deep.equal("C:\\Users\\s p a c e\\program.exe");
    });
    test("WSL with array arguments and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("WSL with array arguments and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("WSL with array arguments + debugger command and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" -- ignored");
    });
    test("WSL with array arguments + debugger command and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("WSL with string arguments and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("WSL with string arguments and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("WSL with string arguments + debugger command and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("WSL with string arguments + debugger command and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("Windows Docker with string args, debuggerCommand", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithStringArgsAndDebuggerCommand();
        // quoteArgs flag should be ignored
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs);
        pipeCmd.should.deep.equal("docker -i exec 1234567 " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Windows Docker with array args", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs);
        pipeCmd.should.deep.equal("docker -i exec 1234567 " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Windows Docker with array args with quotes", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("docker -i exec 1234567 \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("Linux dotnet with array args and spaces", () => {
        let pipeTransport = GetLinuxLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal(`/usr/bin/shared/dotnet bin/framework/myprogram.dll \"argument with spaces\" \"${processPicker_1.RemoteAttachPicker.scriptShellCmd}\"`);
    });
    test("Multiple ${debuggerCommand} in string args", () => {
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString("program.exe", "".concat(processPicker_1.RemoteAttachPicker.debuggerCommand, " ", processPicker_1.RemoteAttachPicker.debuggerCommand, " ", processPicker_1.RemoteAttachPicker.debuggerCommand), true);
        pipeCmd.should.deep.equal("program.exe " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Multiple ${debuggerCommand} in array args", () => {
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray("program.exe", [processPicker_1.RemoteAttachPicker.debuggerCommand, processPicker_1.RemoteAttachPicker.debuggerCommand, processPicker_1.RemoteAttachPicker.debuggerCommand], true);
        pipeCmd.should.deep.equal("program.exe \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("OS Specific Configurations", () => {
        let launch = GetOSSpecificJSON();
        let pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "win32");
        pipeTransport.pipeProgram.should.deep.equal("Windows pipeProgram");
        pipeTransport.pipeArgs.should.deep.equal("windows");
        pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "darwin");
        pipeTransport.pipeProgram.should.deep.equal("OSX pipeProgram");
        pipeTransport.pipeArgs.should.deep.equal(["osx"]);
        pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "linux");
        pipeTransport.pipeProgram.should.deep.equal("Linux pipeProgram");
        // Linux pipeTransport does not have args defined, should use the one defined in pipeTransport.
        pipeTransport.pipeArgs.should.deep.equal([]);
    });
});
function GetWindowsWSLLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: ["-c"]
    };
}
function GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: ["-c", "${debuggerCommand}", "--", "ignored"]
    };
}
function GetWindowsWSLLaunchJSONWithStringArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: "-c"
    };
}
function GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: "-c ${debuggerCommand} -- ignored"
    };
}
function GetWindowsDockerLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "docker",
        pipeArgs: ["-i", "exec", "1234567"],
        quoteArgs: false
    };
}
function GetWindowsDockerLaunchJSONWithStringArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "docker",
        pipeArgs: "-i exec 1234567 ${debuggerCommand}",
        quoteArgs: false
    };
}
function GetLinuxLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "/usr/bin/shared/dotnet",
        pipeArgs: ["bin/framework/myprogram.dll", "argument with spaces"],
        quoteArg: true
    };
}
function GetOSSpecificJSON() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "pipeProgram",
        pipeArgs: [],
        windows: {
            pipeProgram: "Windows pipeProgram",
            pipeArgs: "windows"
        },
        osx: {
            pipeProgram: "OSX pipeProgram",
            pipeArgs: ["osx"]
        },
        linux: {
            pipeProgram: "Linux pipeProgram",
        }
    };
}
//# sourceMappingURL=processPicker.test.js.map