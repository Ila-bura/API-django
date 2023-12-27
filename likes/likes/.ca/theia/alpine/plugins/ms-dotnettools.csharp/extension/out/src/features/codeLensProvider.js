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
const protocol = require("../omnisharp/protocol");
const serverUtils = require("../omnisharp/utils");
const vscode = require("vscode");
const typeConversion_1 = require("../omnisharp/typeConversion");
const abstractProvider_1 = require("./abstractProvider");
var Structure = protocol.V2.Structure;
var SymbolKinds = protocol.V2.SymbolKinds;
var SymbolPropertyNames = protocol.V2.SymbolPropertyNames;
var SymbolRangeNames = protocol.V2.SymbolRangeNames;
class OmniSharpCodeLens extends vscode.CodeLens {
    constructor(range, fileName) {
        super(new vscode.Range(range.Start.Line, range.Start.Column, range.End.Line, range.End.Column));
        this.fileName = fileName;
    }
}
class ReferencesCodeLens extends OmniSharpCodeLens {
    constructor(range, fileName) {
        super(range, fileName);
    }
}
class TestCodeLens extends OmniSharpCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName);
        this.displayName = displayName;
        this.isTestContainer = isTestContainer;
        this.testFramework = testFramework;
        this.testMethodNames = testMethodNames;
    }
}
class RunTestsCodeLens extends TestCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName, displayName, isTestContainer, testFramework, testMethodNames);
    }
}
class DebugTestsCodeLens extends TestCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName, displayName, isTestContainer, testFramework, testMethodNames);
    }
}
class OmniSharpCodeLensProvider extends abstractProvider_1.default {
    constructor(server, testManager, optionProvider, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this.optionProvider = optionProvider;
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.optionProvider.GetLatestOptions();
            if (!options.showReferencesCodeLens && !options.showTestsCodeLens) {
                return [];
            }
            try {
                const response = yield serverUtils.codeStructure(this._server, { FileName: document.fileName }, token);
                if (response && response.Elements) {
                    return createCodeLenses(response.Elements, document.fileName, options);
                }
            }
            catch (error) { }
            return [];
        });
    }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof ReferencesCodeLens) {
                return this.resolveReferencesCodeLens(codeLens, token);
            }
            else if (codeLens instanceof RunTestsCodeLens) {
                return this.resolveTestCodeLens(codeLens, 'Run Test', 'dotnet.test.run', 'Run All Tests', 'dotnet.classTests.run');
            }
            else if (codeLens instanceof DebugTestsCodeLens) {
                return this.resolveTestCodeLens(codeLens, 'Debug Test', 'dotnet.test.debug', 'Debug All Tests', 'dotnet.classTests.debug');
            }
        });
    }
    resolveReferencesCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: codeLens.fileName,
                Line: codeLens.range.start.line,
                Column: codeLens.range.start.character,
                OnlyThisFile: false,
                ExcludeDefinition: true
            };
            try {
                let result = yield serverUtils.findUsages(this._server, request, token);
                if (!result || !result.QuickFixes) {
                    return undefined;
                }
                const quickFixes = result.QuickFixes;
                const count = quickFixes.length;
                const locations = quickFixes.map(typeConversion_1.toLocation);
                // Allow language middlewares to re-map its edits if necessary.
                const remappedLocations = yield this._languageMiddlewareFeature.remap("remapLocations", locations, token);
                codeLens.command = {
                    title: count === 1 ? '1 reference' : `${count} references`,
                    command: 'editor.action.showReferences',
                    arguments: [vscode.Uri.file(request.FileName), codeLens.range.start, remappedLocations]
                };
                return codeLens;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    resolveTestCodeLens(codeLens, singularTitle, singularCommandName, pluralTitle, pluralCommandName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!codeLens.isTestContainer) {
                // This is just a single test method, not a container.
                codeLens.command = {
                    title: singularTitle,
                    command: singularCommandName,
                    arguments: [codeLens.testMethodNames[0], codeLens.fileName, codeLens.testFramework]
                };
                return codeLens;
            }
            let projectInfo;
            try {
                projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: codeLens.fileName });
            }
            catch (error) {
                return undefined;
            }
            if (projectInfo.MsBuildProject) {
                codeLens.command = {
                    title: pluralTitle,
                    command: pluralCommandName,
                    arguments: [codeLens.displayName, codeLens.testMethodNames, codeLens.fileName, codeLens.testFramework]
                };
            }
            return codeLens;
        });
    }
}
exports.default = OmniSharpCodeLensProvider;
function createCodeLenses(elements, fileName, options) {
    let results = [];
    Structure.walkCodeElements(elements, element => {
        let codeLenses = createCodeLensesForElement(element, fileName, options);
        results.push(...codeLenses);
    });
    return results;
}
function createCodeLensesForElement(element, fileName, options) {
    let results = [];
    if (options.showReferencesCodeLens && isValidElementForReferencesCodeLens(element, options)) {
        let range = element.Ranges[SymbolRangeNames.Name];
        if (range) {
            results.push(new ReferencesCodeLens(range, fileName));
        }
    }
    if (options.showTestsCodeLens) {
        if (isValidMethodForTestCodeLens(element)) {
            let [testFramework, testMethodName] = getTestFrameworkAndMethodName(element);
            let range = element.Ranges[SymbolRangeNames.Name];
            if (range && testFramework && testMethodName) {
                results.push(new RunTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ false, testFramework, [testMethodName]));
                results.push(new DebugTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ false, testFramework, [testMethodName]));
            }
        }
        else if (isValidClassForTestCodeLens(element)) {
            // Note: We don't handle multiple test frameworks in the same class. The first test framework wins.
            let testFramework = null;
            let testMethodNames = [];
            let range = element.Ranges[SymbolRangeNames.Name];
            for (let childElement of element.Children) {
                let [childTestFramework, childTestMethodName] = getTestFrameworkAndMethodName(childElement);
                if (!testFramework && childTestFramework) {
                    testFramework = childTestFramework;
                    testMethodNames.push(childTestMethodName);
                }
                else if (testFramework && childTestFramework === testFramework) {
                    testMethodNames.push(childTestMethodName);
                }
            }
            results.push(new RunTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ true, testFramework, testMethodNames));
            results.push(new DebugTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ true, testFramework, testMethodNames));
        }
    }
    return results;
}
const filteredSymbolNames = {
    'Equals': true,
    'Finalize': true,
    'GetHashCode': true,
    'ToString': true,
    'Dispose': true,
    'GetEnumerator': true,
};
function isValidElementForReferencesCodeLens(element, options) {
    if (element.Kind === SymbolKinds.Namespace) {
        return false;
    }
    if (element.Kind === SymbolKinds.Method && filteredSymbolNames[element.Name]) {
        return false;
    }
    if (options.filteredSymbolsCodeLens.includes(element.Name)) {
        return false;
    }
    return true;
}
function isValidClassForTestCodeLens(element) {
    if (element.Kind != SymbolKinds.Class) {
        return false;
    }
    if (!element.Children) {
        return false;
    }
    return element.Children.find(isValidMethodForTestCodeLens) !== undefined;
}
function isValidMethodForTestCodeLens(element) {
    if (element.Kind != SymbolKinds.Method) {
        return false;
    }
    if (!element.Properties ||
        !element.Properties[SymbolPropertyNames.TestFramework] ||
        !element.Properties[SymbolPropertyNames.TestMethodName]) {
        return false;
    }
    return true;
}
function getTestFrameworkAndMethodName(element) {
    if (!element.Properties) {
        return [null, null];
    }
    const testFramework = element.Properties[SymbolPropertyNames.TestFramework];
    const testMethodName = element.Properties[SymbolPropertyNames.TestMethodName];
    return [testFramework, testMethodName];
}
//# sourceMappingURL=codeLensProvider.js.map