"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.findExecutableMSBuildProjects = exports.getDotNetCoreProjectDescriptors = exports.isDotNetCoreProject = exports.findNetStandardTargetFramework = exports.findModernNetFrameworkTargetFramework = exports.findNetCoreAppTargetFramework = exports.findNetCoreTargetFramework = exports.findNetFrameworkTargetFramework = exports.V2 = exports.FixAllScope = exports.FileChangeType = exports.FileModificationType = exports.DiagnosticStatus = exports.Requests = void 0;
const path = require("path");
var Requests;
(function (Requests) {
    Requests.AddToProject = '/addtoproject';
    Requests.CodeCheck = '/codecheck';
    Requests.CodeFormat = '/codeformat';
    Requests.ChangeBuffer = '/changebuffer';
    Requests.FilesChanged = '/filesChanged';
    Requests.FindSymbols = '/findsymbols';
    Requests.FindUsages = '/findusages';
    Requests.FormatAfterKeystroke = '/formatAfterKeystroke';
    Requests.FormatRange = '/formatRange';
    Requests.GetCodeActions = '/getcodeactions';
    Requests.GoToDefinition = '/gotoDefinition';
    Requests.FindImplementations = '/findimplementations';
    Requests.Project = '/project';
    Requests.Projects = '/projects';
    Requests.RemoveFromProject = '/removefromproject';
    Requests.Rename = '/rename';
    Requests.RunCodeAction = '/runcodeaction';
    Requests.SignatureHelp = '/signatureHelp';
    Requests.TypeLookup = '/typelookup';
    Requests.UpdateBuffer = '/updatebuffer';
    Requests.Metadata = '/metadata';
    Requests.RunFixAll = '/runfixall';
    Requests.GetFixAll = '/getfixall';
    Requests.ReAnalyze = '/reanalyze';
    Requests.QuickInfo = '/quickinfo';
    Requests.Completion = '/completion';
    Requests.CompletionResolve = '/completion/resolve';
    Requests.CompletionAfterInsert = '/completion/afterInsert';
})(Requests = exports.Requests || (exports.Requests = {}));
var DiagnosticStatus;
(function (DiagnosticStatus) {
    DiagnosticStatus[DiagnosticStatus["Processing"] = 0] = "Processing";
    DiagnosticStatus[DiagnosticStatus["Ready"] = 1] = "Ready";
})(DiagnosticStatus = exports.DiagnosticStatus || (exports.DiagnosticStatus = {}));
var FileModificationType;
(function (FileModificationType) {
    FileModificationType[FileModificationType["Modified"] = 0] = "Modified";
    FileModificationType[FileModificationType["Opened"] = 1] = "Opened";
    FileModificationType[FileModificationType["Renamed"] = 2] = "Renamed";
})(FileModificationType = exports.FileModificationType || (exports.FileModificationType = {}));
var FileChangeType;
(function (FileChangeType) {
    FileChangeType["Change"] = "Change";
    FileChangeType["Create"] = "Create";
    FileChangeType["Delete"] = "Delete";
    FileChangeType["DirectoryDelete"] = "DirectoryDelete";
})(FileChangeType = exports.FileChangeType || (exports.FileChangeType = {}));
var FixAllScope;
(function (FixAllScope) {
    FixAllScope["Document"] = "Document";
    FixAllScope["Project"] = "Project";
    FixAllScope["Solution"] = "Solution";
})(FixAllScope = exports.FixAllScope || (exports.FixAllScope = {}));
var V2;
(function (V2) {
    let Requests;
    (function (Requests) {
        Requests.GetCodeActions = '/v2/getcodeactions';
        Requests.RunCodeAction = '/v2/runcodeaction';
        Requests.GetTestStartInfo = '/v2/getteststartinfo';
        Requests.RunTest = '/v2/runtest';
        Requests.RunAllTestsInClass = "/v2/runtestsinclass";
        Requests.RunTestsInContext = "/v2/runtestsincontext";
        Requests.DebugTestGetStartInfo = '/v2/debugtest/getstartinfo';
        Requests.DebugTestsInClassGetStartInfo = '/v2/debugtestsinclass/getstartinfo';
        Requests.DebugTestsInContextGetStartInfo = '/v2/debugtestsincontext/getstartinfo';
        Requests.DebugTestLaunch = '/v2/debugtest/launch';
        Requests.DebugTestStop = '/v2/debugtest/stop';
        Requests.DiscoverTests = '/v2/discovertests';
        Requests.BlockStructure = '/v2/blockstructure';
        Requests.CodeStructure = '/v2/codestructure';
        Requests.Highlight = '/v2/highlight';
    })(Requests = V2.Requests || (V2.Requests = {}));
    let TestOutcomes;
    (function (TestOutcomes) {
        TestOutcomes.None = 'none';
        TestOutcomes.Passed = 'passed';
        TestOutcomes.Failed = 'failed';
        TestOutcomes.Skipped = 'skipped';
        TestOutcomes.NotFound = 'notfound';
    })(TestOutcomes = V2.TestOutcomes || (V2.TestOutcomes = {}));
    let SymbolKinds;
    (function (SymbolKinds) {
        // types
        SymbolKinds.Class = 'class';
        SymbolKinds.Delegate = 'delegate';
        SymbolKinds.Enum = 'enum';
        SymbolKinds.Interface = 'interface';
        SymbolKinds.Struct = 'struct';
        // members
        SymbolKinds.Constant = 'constant';
        SymbolKinds.Constructor = 'constructor';
        SymbolKinds.Destructor = 'destructor';
        SymbolKinds.EnumMember = 'enummember';
        SymbolKinds.Event = 'event';
        SymbolKinds.Field = 'field';
        SymbolKinds.Indexer = 'indexer';
        SymbolKinds.Method = 'method';
        SymbolKinds.Operator = 'operator';
        SymbolKinds.Property = 'property';
        // other
        SymbolKinds.Namespace = 'namespace';
        SymbolKinds.Unknown = 'unknown';
    })(SymbolKinds = V2.SymbolKinds || (V2.SymbolKinds = {}));
    let SymbolAccessibilities;
    (function (SymbolAccessibilities) {
        SymbolAccessibilities.Internal = 'internal';
        SymbolAccessibilities.Private = 'private';
        SymbolAccessibilities.PrivateProtected = 'private protected';
        SymbolAccessibilities.Protected = 'protected';
        SymbolAccessibilities.ProtectedInternal = 'protected internal';
        SymbolAccessibilities.Public = 'public';
    })(SymbolAccessibilities = V2.SymbolAccessibilities || (V2.SymbolAccessibilities = {}));
    let SymbolPropertyNames;
    (function (SymbolPropertyNames) {
        SymbolPropertyNames.Accessibility = 'accessibility';
        SymbolPropertyNames.Static = 'static';
        SymbolPropertyNames.TestFramework = 'testFramework';
        SymbolPropertyNames.TestMethodName = 'testMethodName';
    })(SymbolPropertyNames = V2.SymbolPropertyNames || (V2.SymbolPropertyNames = {}));
    let SymbolRangeNames;
    (function (SymbolRangeNames) {
        SymbolRangeNames.Attributes = 'attributes';
        SymbolRangeNames.Full = 'full';
        SymbolRangeNames.Name = 'name';
    })(SymbolRangeNames = V2.SymbolRangeNames || (V2.SymbolRangeNames = {}));
    let Structure;
    (function (Structure) {
        function walkCodeElements(elements, action) {
            function walker(elements, parentElement) {
                for (let element of elements) {
                    action(element, parentElement);
                    if (element.Children) {
                        walker(element.Children, element);
                    }
                }
            }
            walker(elements);
        }
        Structure.walkCodeElements = walkCodeElements;
    })(Structure = V2.Structure || (V2.Structure = {}));
})(V2 = exports.V2 || (exports.V2 = {}));
function findNetFrameworkTargetFramework(project) {
    let regexp = new RegExp('^net[1-4]');
    return project.TargetFrameworks.find(tf => regexp.test(tf.ShortName));
}
exports.findNetFrameworkTargetFramework = findNetFrameworkTargetFramework;
function findNetCoreTargetFramework(project) {
    var _a;
    return (_a = findNetCoreAppTargetFramework(project)) !== null && _a !== void 0 ? _a : findModernNetFrameworkTargetFramework(project);
}
exports.findNetCoreTargetFramework = findNetCoreTargetFramework;
function findNetCoreAppTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp'));
}
exports.findNetCoreAppTargetFramework = findNetCoreAppTargetFramework;
function findModernNetFrameworkTargetFramework(project) {
    let regexp = new RegExp('^net[5-9]');
    const targetFramework = project.TargetFrameworks.find(tf => regexp.test(tf.ShortName));
    // Shortname is being reported as net50 instead of net5.0
    if (targetFramework !== undefined && targetFramework.ShortName.charAt(4) !== ".") {
        targetFramework.ShortName = targetFramework.ShortName.substr(0, 4) + "." + targetFramework.ShortName.substr(4);
    }
    return targetFramework;
}
exports.findModernNetFrameworkTargetFramework = findModernNetFrameworkTargetFramework;
function findNetStandardTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netstandard'));
}
exports.findNetStandardTargetFramework = findNetStandardTargetFramework;
function isDotNetCoreProject(project) {
    return findNetCoreTargetFramework(project) !== undefined ||
        findNetStandardTargetFramework(project) !== undefined ||
        findNetFrameworkTargetFramework(project) !== undefined;
}
exports.isDotNetCoreProject = isDotNetCoreProject;
function getDotNetCoreProjectDescriptors(info) {
    let result = [];
    if (info.DotNet && info.DotNet.Projects.length > 0) {
        for (let project of info.DotNet.Projects) {
            result.push({
                Name: project.Name,
                Directory: project.Path,
                FilePath: path.join(project.Path, 'project.json')
            });
        }
    }
    if (info.MsBuild && info.MsBuild.Projects.length > 0) {
        for (let project of info.MsBuild.Projects) {
            if (isDotNetCoreProject(project)) {
                result.push({
                    Name: path.basename(project.Path),
                    Directory: path.dirname(project.Path),
                    FilePath: project.Path
                });
            }
        }
    }
    return result;
}
exports.getDotNetCoreProjectDescriptors = getDotNetCoreProjectDescriptors;
function findExecutableMSBuildProjects(projects) {
    let result = [];
    projects.forEach(project => {
        const projectIsNotNetFramework = findNetCoreTargetFramework(project) !== undefined
            || project.IsBlazorWebAssemblyStandalone;
        if (project.IsExe && projectIsNotNetFramework) {
            result.push(project);
        }
    });
    return result;
}
exports.findExecutableMSBuildProjects = findExecutableMSBuildProjects;
//# sourceMappingURL=protocol.js.map